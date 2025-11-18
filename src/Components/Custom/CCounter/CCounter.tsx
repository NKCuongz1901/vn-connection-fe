import React, { memo } from 'react'

import classes from './CCounter.module.scss'
const CCounter = ({ number }) => {
	return <div className={classes.wrapper}>{number}</div>
}

export default memo(CCounter)
