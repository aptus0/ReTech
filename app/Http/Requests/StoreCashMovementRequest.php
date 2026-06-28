<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCashMovementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'cash_register_id' => ['required', 'exists:cash_registers,id'],
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'account_id' => ['nullable', 'exists:customers,id'],
            'type' => ['required', 'string', 'in:income,expense,collection,payment'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string'],
            'movement_date' => ['required', 'date'],
        ];
    }
}
