import * as React from "react"
import jwtDecode from "jwt-decode"
import type { INetwork } from "../types/network"
import { usePersistentStateContext } from "@app/store/persistent-state"

// key used to stored the token within the phone
export const TOKEN_KEY = "GaloyToken"

export const decodeToken: (string) => {
  uid: string
  network: INetwork
} | null = (token) => {
  try {
    const { uid, network } = jwtDecode<JwtPayload>(token)
    return { uid, network }
  } catch (err) {
    console.debug(err.toString())
    return null
  }
}

type UseTokenReturn = {
  token: string | undefined
  hasToken: boolean
  saveToken: (token: string) => void
  clearToken: () => void
}

export const getAuthorizationHeader = (token: string): string => {
  return `Bearer ${token}`
}

const useToken = (): UseTokenReturn => {
  const { persistentState, updateState } = usePersistentStateContext()

  return React.useMemo(
    () => ({
      token: persistentState.galoyAuthToken,
      hasToken: Boolean(persistentState.galoyAuthToken),
      saveToken: (token: string) => {
        updateState((state) => ({
          ...state,
          galoyAuthToken: token,
        }))
      },
      clearToken: () => {
        updateState((state) => ({
          ...state,
          galoyAuthToken: "",
        }))
      },
    }),
    [persistentState.galoyAuthToken, updateState],
  )
}

export default useToken
