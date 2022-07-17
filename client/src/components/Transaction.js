import React from "react";

const Transaction = ({ transaction }) => {
    const { input, outputMap } = transaction;
    const recipients = Object.keys(outputMap);

    return(
        <div className="Transaction">
            <p>From: {`${input.address.substring(0, 20)}...`} | Balance: { input.amount }</p>
            {
                recipients.map(recipient => (
                        <p key={recipient}>
                            To: { `${recipient.substring(0, 20)}...`} | Sent: { outputMap[recipient] }

                        </p>
                    ))
            }
        </div>
    )
}

export default Transaction;

