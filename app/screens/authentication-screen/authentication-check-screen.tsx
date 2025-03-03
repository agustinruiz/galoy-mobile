import * as React from "react"
import { useEffect } from "react"
import { Image } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { useApolloClient } from "@apollo/client"

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import BiometricWrapper from "../../utils/biometricAuthentication"
import type { ScreenType } from "../../types/jsx"
import { AuthenticationScreenPurpose, PinScreenPurpose } from "../../utils/enum"
import { showModalClipboardIfValidPayment } from "../../utils/clipboard"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"

import BitcoinBeachLogo from "../get-started-screen/bitcoin-beach-logo.png"
import useToken from "../../hooks/use-token"
import useMainQuery from "@app/hooks/use-main-query"
import { useAuthenticationContext } from "@app/store/authentication-context"
import { useAppConfig } from "@app/hooks"

const styles = EStyleSheet.create({
  Logo: {
    marginTop: 24,
    maxHeight: "50%",
    maxWidth: "50%",
  },

  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "authenticationCheck">
}

export const AuthenticationCheckScreen: ScreenType = ({ navigation }: Props) => {
  const client = useApolloClient()
  const { hasToken } = useToken()
  const { appConfig } = useAppConfig()
  const bitcoinNetwork = appConfig.galoyInstance.network
  const { myPubKey, username } = useMainQuery()
  const { setAppUnlocked } = useAuthenticationContext()

  useEffect(() => {
    ;(async () => {
      const isPinEnabled = await KeyStoreWrapper.getIsPinEnabled()

      if (
        (await BiometricWrapper.isSensorAvailable()) &&
        (await KeyStoreWrapper.getIsBiometricsEnabled())
      ) {
        navigation.replace("authentication", {
          screenPurpose: AuthenticationScreenPurpose.Authenticate,
          isPinEnabled,
        })
      } else if (isPinEnabled) {
        navigation.replace("pin", { screenPurpose: PinScreenPurpose.AuthenticatePin })
      } else {
        setAppUnlocked()
        navigation.replace("Primary")
        if (hasToken) {
          showModalClipboardIfValidPayment({
            client,
            network: bitcoinNetwork,
            myPubKey,
            username,
          })
        }
      }
    })()
  }, [client, hasToken, myPubKey, navigation, bitcoinNetwork, username, setAppUnlocked])

  return (
    <Screen
      style={styles.container}
      backgroundColor={palette.white}
      statusBar="light-content"
    >
      <Image style={styles.Logo} source={BitcoinBeachLogo} resizeMode="contain" />
    </Screen>
  )
}
