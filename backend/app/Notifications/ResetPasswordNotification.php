<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;

class ResetPasswordNotification extends BaseResetPassword
{
    /**
     * The password reset token.
     */
    public $token;

    public function __construct(string $token)
    {
        $this->token = $token;
    }

    /**
     * Build the mail representation of the notification.
     */
    public function toMail(mixed $notifiable): MailMessage
    {
        $resetUrl = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('Reset Your Password — SOFAMEL')
            ->view('emails.reset-password', [
                'resetUrl' => $resetUrl,
                'user'     => $notifiable,
                'logoPath' => public_path('images/logo.png'),
            ]);
    }

    /**
     * Build the reset URL pointing to the frontend (same logic as AppServiceProvider).
     */
    protected function resetUrl(mixed $notifiable): string
    {
        $origin = request()->header('origin');

        $allowedFrontends = [
            'http://localhost:5173',
            'http://localhost:5174',
        ];

        if (!in_array($origin, $allowedFrontends)) {
            $origin = env('FRONTEND_URL');
        }

        return $origin
            . '/reset-password?token=' . $this->token
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
    }
}