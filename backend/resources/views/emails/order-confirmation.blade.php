<!-- resources/views/emails/order-confirmation.blade.php -->
<!-- resources/views/emails/order-confirmation.blade.php -->
<!-- resources/views/emails/order-confirmation.blade.php -->

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Order Confirmation</title>
</head>

<body style="margin:0; padding:0; font-family:Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
        <td align="center">

            <!-- Container -->
            <table width="600" cellpadding="0" cellspacing="0"
                style="background:rgba(17,24,39,0.95);
                border-radius:18px;
                overflow:hidden;
                border:1px solid #1F2937;
                box-shadow:0 24px 48px rgba(0,0,0,0.6);">

                <!-- HEADER -->
                <tr>
                    <td style="padding:25px; background:#0D1117; border-bottom:1px solid #1F2937;">
                        <table cellpadding="0" cellspacing="0" align="center">
                            <tr>
                                <!-- Logo -->
                                <td>
                                    <img src="{{ $message->embed($logoPath) }}"
                                        width="50"
                                        height="50"
                                        style="border-radius:50%; display:block; border:1px solid #F59E0B;"
                                        alt="SOFAMEL">
                                </td>

                                <!-- Text -->
                                <td style="padding-left:12px;">
                                    <div style="color:#fff; font-size:16px; font-weight:600;">
                                        Sofamel Maroc
                                    </div>
                                    <div style="color:#F59E0B; font-size:11px; letter-spacing:0.05em;">
                                        Electrical Equipment Supplier in Morocco
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- CONTENT -->
                <tr>
                    <td style="padding:35px; color:#E5E7EB;">

                        <h2 style="color:#F59E0B; margin:0 0 15px; font-size:20px;">
                            Order Confirmed 🎉
                        </h2>

                        <p style="margin:0 0 10px; color:#D1D5DB;">
                            Hello <strong style="color:#fff;">{{ $order->user->name }}</strong>,
                        </p>

                        <!-- ORDER BOX -->
                        <table width="100%" cellpadding="0" cellspacing="0"
                            style="margin:20px 0;
                            background:rgba(245,158,11,0.08);
                            border-left:4px solid #F59E0B;
                            border-radius:10px;">
                            <tr>
                                <td style="padding:15px; color:#E5E7EB;">
                                    We have successfully received your order
                                    <strong style="color:#F59E0B;">#{{ $order->id }}</strong>.
                                </td>
                            </tr>
                        </table>

                        <p style="margin:0 0 10px; color:#9CA3AF;">
                            Your quotation PDF is attached to this email.
                        </p>

                        <p style="margin:0 0 20px; color:#9CA3AF;">
                            Our team will review your request and contact you shortly.
                        </p>

                        <p style="margin-top:30px; color:#9CA3AF;">
                            Best regards,<br>
                            <strong style="color:#fff;">SOFAMEL Team</strong>
                        </p>

                    </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                    <td style="text-align:center;
                        font-size:12px;
                        color:#6B7280;
                        padding:15px;
                        border-top:1px solid #1F2937;
                        background:#0D1117;">
                        © {{ date('Y') }} SOFAMEL. All rights reserved.
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>