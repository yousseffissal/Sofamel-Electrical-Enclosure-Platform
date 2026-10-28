<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class AdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public string $title;
    public string $message;
    public $senderId;
    public $globalId;

    public function __construct(
        $title,
        $message,
        $senderId,
        $globalId = null
    ) {
        $this->title = $title;
        $this->message = $message;
        $this->senderId = $senderId;
        $this->globalId = $globalId;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'sender_id' => $this->senderId,
            'global_id' => $this->globalId,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title' => $this->title,
            'message' => $this->message,
            'sender_id' => $this->senderId,
            'global_id' => $this->globalId,
            'created_at' => now(),
            'read_at' => null,
        ]);
    }

    public function toArray($notifiable)
    {
        return $this->toDatabase($notifiable);
    }
}
