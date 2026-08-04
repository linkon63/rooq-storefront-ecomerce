import { FiCheckSquare, FiShoppingCart } from "react-icons/fi";
import { LuPackageCheck } from "react-icons/lu";

type Step = "cart" | "checkout" | "complete";

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "cart", label: "Shopping Cart", icon: <FiShoppingCart size={17} /> },
  { id: "checkout", label: "Checkout", icon: <FiCheckSquare size={17} /> },
  { id: "complete", label: "Order Complete", icon: <LuPackageCheck size={17} /> },
];

/** Three-step progress indicator shown above cart, checkout and confirmation. */
export default function CheckoutSteps({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 md:pt-14">
      <div className="flex items-start">
        {STEPS.map((step, index) => {
          const reached = index <= currentIndex;
          const connectorFilled = index < currentIndex;

          return (
            <div key={step.id} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col items-center">
                <span
                  className={`flex h-10 w-10 items-center justify-center ${
                    reached ? "bg-[#1f2a17] text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step.icon}
                </span>
                <span
                  className={`font-display mt-4 text-center text-lg md:text-2xl ${
                    reached ? "text-[#1f2a17]" : "text-gray-300"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <span
                  className={`mt-5 h-[3px] flex-1 ${connectorFilled ? "bg-[#1f2a17]" : "bg-gray-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
