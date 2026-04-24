export const createPaymentIntention = async (
  bookingInfo: any,
  userData: any,
) => {
  const url = "https://accept.paymob.com/v1/intention/";

  const body = JSON.stringify({
    amount: Math.round(bookingInfo.deposit * 100),
    currency: "EGP",
    payment_methods: [Number(process.env.PAYMOB_INTEGRATION_ID)],
    items: [
      {
        name: "Field Booking Deposit",
        amount: Math.round(bookingInfo.deposit * 100),
        description: `Deposit for field ${bookingInfo.field} on ${bookingInfo.bookingDate}`,
        quantity: 1,
      },
    ],
    billing_data: {
      first_name: userData.name.split(" ")[0] || "Guest",
      last_name: userData.name.split(" ")[1] || "User",
      phone_number: userData.phone || "+201024753111",
      email: userData.email,
      apartment: "NA",
      floor: "NA",
      street: "NA",
      building: "NA",
      city: "Tanta",
      country: "EG",
      state: "Gharbia",
    },
    special_reference: `PAY-${userData._id}-${Date.now()}`,

    extras: {
      fieldId: bookingInfo.field,
      bookingDate: bookingInfo.bookingDate,
      startTime: bookingInfo.startTime,
      endTime: bookingInfo.endTime,
      userId: userData._id.toString(),
      totalPrice: bookingInfo.totalPrice,
      duration: bookingInfo.duration,
      nightCost: bookingInfo.nightCost,
    },

    notification_url: `${process.env.BACKEND_URL}/api/v1/fields/${bookingInfo.field}/bookings/webhook`,
    redirection_url: `${process.env.FRONTEND_URL}/booking-success`,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYMOB_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Paymob Detailed Error:", data);
    throw new Error(`Paymob Error: ${data.message || response.statusText}`);
  }

  return data;
};
