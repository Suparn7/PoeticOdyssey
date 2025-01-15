import React, {useId} from "react"

function Select ({
    options,
    label,
    className,
    ...props
}, ref){
    const id  = useId()
    return (
        <div className="w-full">
            {label && (
                <label 
                    htmlFor={id}
                    className='inline-block pl-1 text-lg font-semibold text-gray-100 mb-2'
                >
                    {label}
                </label>
            )}
            <select
            {...props}
            id={id}
            ref={ref}
            className={`px-2 py-2 rounded-lg text-black outline-none focus:bg-gray-50
                duration-200 border border-gray-200 w-full text-lg bg-transparent border-none focus:ring-0 text-white outline-none ${className}`}
            >
                {
                    options.map((option) => (
                        <option
                        className="bg-slate-300 text-black shadow-2xl rounded-lg overflow-hidden"
                         key={option} 
                         value={option}
                         >
                            {option}
                        </option>
                    ))
                }
            </select>
        </div>
    )
}

export default React.forwardRef(Select)