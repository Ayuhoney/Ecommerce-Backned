
const nodemailer = require("nodemailer");

const mailTrackId = async (email, order) => {

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: 587,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    let success = await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Thank you for your order.",
       html: `

    <div style="text-align:center;">
        <h1 style="font-size:22px;">Thank you for your order!</h1>
        <h2 class="customerName">Hi ${order.shippingInfo.name}</h2>
        <h2>Your order has been confirmed and will be shipping soon.</h2>
        <br>
        <h3>Track your order: 
         ${process.env.HOST_URL}/order/${order._id} </h3>
    </div>
    <hr style="width: 100%;">
    <table style="width:100%; font-size:16px;  border-spacing: 10px;">
      <thead>
        <tr>
          <th>Order_Date</th>
          <th>Order_Id</th>
          <th>Payment_Method</th>
          <th>Shipping_address</th>
        </tr>
      </thead>
      <tbody>
        <tr style="padding:10px; text-align:center;">
          <td>${order.createdAt.toLocaleString()}</td>
          <td>${order._id}</td>
          <td>Visa Card</td>
          <td>${order.shippingInfo.address.city}</td>
        </tr>
      </tbody>
    </table>
    <hr style="width: 100%;">
    <br>
    <br>
    <h1 style="font-size:22p_idx; text-align:center;">Order Details</h1>
    <hr>
    <table style="width:100%; height:100%; font-size:14px;  border-spacing: 10px;">
        <thead>
          <tr>
            <th>Sno.</th>
            <th>Name</th>
            <th>Qty</th>
            <th style="text-align:end;">Amount</th>
          </tr>
        </thead>
        <tbody">
          ${order.items
            .map((item, index) => {
              return ` 
          <tr style="padding:10px; text-align:center; ">
            <td>${index + 1}</td>
            <td>${item.productId.title}</td>
            <td>${item.quantity}</td>
            <td style="text-align:end;">$ ${item.productId.price}</td>
          </tr> `;
            })
            .join("")}
        </tbody>
    </table>
    <hr style="width: 100%;">
            <table style="width:100%; height:100%; font-size:14px;  border-spacing: 10px;">
             <tbody>
               <tr>
                <td style="text-align:start;" >Total</td>
                <td style="text-align:end;">$ ${
                  order.totalPrice
                }</td>
                </tr >
             </tbody>
            </table>
                 <br>
                <h3><Please do not hesitate to contact us on if you have any questions./h3>
                <h3>Thank you for choose us</h3>   
                <h3>Ayush Sharma</h3> `,

    });
    if (success) {
      // console.log("success",success)
      return success;
    }
  } catch (error) {
    console.log("error",error)
    return error;
  }
};



module.exports = mailTrackId;










