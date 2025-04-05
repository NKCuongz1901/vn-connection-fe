import ForgetPassword from '@/Container/ForgetPassword'
import { OTP_TYPE } from '@/Variable/common.variable'
import { forgetPasswordStep } from '@/Variable/step.variable'

const page = () => {
	return (
		<ForgetPassword
			type={OTP_TYPE.FORGET_PASSWORD}
			steps={forgetPasswordStep}
		/>
	)
}

export default page
