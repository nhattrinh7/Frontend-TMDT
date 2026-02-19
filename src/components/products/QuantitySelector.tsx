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
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-0">
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="flex h-12 w-12 items-center justify-center border border-r-0 border-gray-300 text-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          −
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={1}
          max={maxQuantity}
          className="h-12 w-20 border border-gray-300 text-center text-base [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          onClick={handleIncrease}
          disabled={quantity >= maxQuantity}
          className="flex h-12 w-12 items-center justify-center border border-l-0 border-gray-300 text-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          +
        </button>
      </div>
      <span className="text-base text-gray-600">
        {maxQuantity} sản phẩm có sẵn
      </span>
    </div>
  )
}
