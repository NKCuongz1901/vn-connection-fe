'use client'

import { IconChevronLeft } from '@tabler/icons-react'

import CCheckbox from '@/Components/Custom/CCheckbox'
import CInput from '@/Components/Custom/CInput'
import useAddBankCard from '@/hooks/Referral/useAddBankCard'

import classes from './AddBankCard.module.scss'

const INPUT_STYLE = {
	borderRadius: 16,
	background: '#f0f3f9',
	height: 44,
}

function AddBankCard() {
	const {
		cardHolderName,
		cardNumber,
		bankName,
		phone,
		email,
		issuedInVietnam,
		agreeTerms,
		isValid,
		loading,
		setCardHolderName,
		setCardNumber,
		setBankName,
		setPhone,
		setEmail,
		setIssuedInVietnam,
		setAgreeTerms,
		onGoBack,
		onSubmit,
	} = useAddBankCard()

	return (
		<div className={classes.wrapper}>
			<div className={classes.header}>
				<button
					type="button"
					className={classes.titleRow}
					onClick={onGoBack}
				>
					<IconChevronLeft size={20} color="#0F1729" />
					<span className={classes.title}>Add bank card</span>
				</button>
				<p className={classes.description}>
					Add your bank card to receive payouts from UniVini.
				</p>
			</div>

			<div className={classes.formCard}>
				<div className={classes.formField}>
					<CInput
						label="Card holder name"
						isRequired
						value={cardHolderName}
						placeholder="Card holder name"
						allowClear={false}
						bordered={false}
						style={INPUT_STYLE}
						onChange={(e) => setCardHolderName(e.target.value)}
					/>
				</div>

				<div className={classes.formField}>
					<CInput
						label="Card number"
						isRequired
						value={cardNumber}
						placeholder="Card number"
						allowClear={false}
						bordered={false}
						style={INPUT_STYLE}
						onChange={(e) => setCardNumber(e.target.value)}
					/>
				</div>

				<div className={classes.formField}>
					<CInput
						label="Bank name"
						isRequired
						value={bankName}
						placeholder="Bank name"
						allowClear={false}
						bordered={false}
						style={INPUT_STYLE}
						onChange={(e) => setBankName(e.target.value)}
					/>
				</div>

				<div className={classes.formField}>
					<CInput
						label="Phone number"
						value={phone}
						placeholder="Phone number"
						allowClear={false}
						bordered={false}
						style={INPUT_STYLE}
						onChange={(e) => setPhone(e.target.value)}
					/>
				</div>

				<div className={`${classes.formField} ${classes.emailField}`}>
					<CInput
						label="Email"
						isRequired
						subLabel="For international banks, UniVini sends money via Wise using your email. Please enter it carefully."
						value={email}
						placeholder="Email"
						allowClear={false}
						bordered={false}
						style={INPUT_STYLE}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>

				<div className={classes.checkboxes}>
					<div className={classes.checkboxItem}>
						<CCheckbox
							checked={issuedInVietnam}
							onChange={(e) => setIssuedInVietnam(e.target.checked)}
						>
							This card was issued in Vietnam
						</CCheckbox>
					</div>
					<div className={classes.checkboxItem}>
						<CCheckbox
							checked={agreeTerms}
							onChange={(e) => setAgreeTerms(e.target.checked)}
						>
							By adding a new card, you agree to the{' '}
							<span className={classes.termsLink}>
								credit/debit card terms
							</span>
						</CCheckbox>
					</div>
				</div>

				<button
					type="button"
					className={classes.submitBtn}
					disabled={!isValid || loading}
					onClick={onSubmit}
				>
					Add
				</button>
			</div>
		</div>
	)
}

export default AddBankCard
