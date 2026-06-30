<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class EDocumentSetting extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'is_active' => 'boolean',
        'e_invoice_enabled' => 'boolean',
        'e_archive_enabled' => 'boolean',
        'auto_send_after_sale' => 'boolean',
    ];

    /**
     * Set the gib_password_encrypted attribute securely.
     */
    public function setGibPasswordAttribute($value)
    {
        if ($value) {
            $this->attributes['gib_password_encrypted'] = Crypt::encryptString($value);
        } else {
            $this->attributes['gib_password_encrypted'] = null;
        }
    }

    /**
     * Get the decrypted gib_password.
     */
    public function getGibPasswordAttribute()
    {
        if (! empty($this->attributes['gib_password_encrypted'])) {
            try {
                return Crypt::decryptString($this->attributes['gib_password_encrypted']);
            } catch (\Exception $e) {
                return null;
            }
        }

        return null;
    }
}
