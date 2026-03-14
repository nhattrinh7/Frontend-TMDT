'use client'

interface QuantitySelectorProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
  maxQuantity: number
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  maxQuantity,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    if (value >= 1 && value <= maxQuantity) {
      onQuantityChange(value)
    }
  }

  return (
    <div className='flex items-center gap-4'>
      <div className='flex items-center border border-slate-200 rounded-md overflow-hidden'>
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className='flex h-10 w-10 items-center justify-center border-r border-slate-200 bg-slate-50 hover:bg-slate-100 text-lg disabled:cursor-not-allowed disabled:opacity-50'
        >
          −
        </button>
        <input
          type='number'
          value={quantity}
          onChange={handleInputChange}
          min={1}
          max={maxQuantity}
          className='h-10 w-16 border-none text-center text-sm bg-transparent focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
        />
        <button
          onClick={handleIncrease}
          disabled={quantity >= maxQuantity}
          className='flex h-10 w-10 items-center justify-center border-l border-slate-200 bg-slate-50 hover:bg-slate-100 text-lg disabled:cursor-not-allowed disabled:opacity-50'
        >
          +
        </button>
      </div>
      <span className='text-xs text-slate-400'>
        {maxQuantity} sản phẩm có sẵn
      </span>
    </div>
  )
}
