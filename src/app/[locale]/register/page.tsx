import ForgetPassword from '@/Container/ForgetPassword'
import { OTP_TYPE } from '@/Variable/common.variable'
import { registerPasswordStep } from '@/Variable/step.variable'

const page = () => {
	return (
		<ForgetPassword type={OTP_TYPE.REGISTER} steps={registerPasswordStep} />
	)
}

export default page
