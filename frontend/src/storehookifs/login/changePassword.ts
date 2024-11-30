import type {
  ChangePasswordIf,
  ChangePasswordParams,
  GetPasswordChangeResult,
  PasswordChangeResult
} from "../../core/login/types"
import { useSelector } from "../../react-redux-wrapper"
import { useChangePasswordMutation } from "../../store/login/api"
import { selectPasswordChangeResult } from "../../store/login/reducer"

const changePassword: () => ChangePasswordIf = () => {
  const changePasswordIf: ChangePasswordIf = {
    useChangePassword: () => {
      const [changePassword, { isLoading }] = useChangePasswordMutation()
      return {
        changePassword: async (params: ChangePasswordParams) => {
          await changePassword(params)
        },
        isLoading,
      }
    },
    useGetPasswordChangeResult: () => {
      const getPasswordChangeResult: GetPasswordChangeResult = () => {
        const passwordChangeResult: PasswordChangeResult =
          useSelector(selectPasswordChangeResult)
        return passwordChangeResult
      }
      return {
        getResult: getPasswordChangeResult
      }
    }
  }
  return changePasswordIf
}

export default changePassword
