"use client";
import type { ShippingInfo } from "@/components/demo/checkout/shpping";
import {
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowContext,
  WorkflowEvent,
} from "@llamaindex/workflow";
import { ReactNode, useCallback, useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";

type Context = {
  userId: string;
  items: { name: string; price: number; quantity: number }[];

  // utility functions with frontend
  update: (ui: ReactNode) => void;
  interrupt: () => void;
};

type UserInfo = {
  id: string;
  name: string;
  email: string;
  shippingAddress: ShippingInfo;
};

const getUser = async (userId: string): Promise<UserInfo | null> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const user = localStorage.getItem(`workflow-demo-user:${userId}`);
  if (user !== null) {
    return JSON.parse(user) as UserInfo;
  } else {
    return null;
  }
};

const checkoutWorkflow = new Workflow<Context, void, void>({});

// 1. User click checkout button
// 2. Check if user has correct information
//   - If not, show shipping information form
// 3. Proceed to payment
// 4. Confirm the order
// 5. Send confirmation email

class ShowShippingInformationFormEvent extends WorkflowEvent<void> {}

class ProceedToPaymentEvent extends WorkflowEvent<void> {}

class ConfirmOrderEvent extends WorkflowEvent<void> {}

class SendConfirmationEmailEvent extends WorkflowEvent<void> {}

checkoutWorkflow.addStep(
  {
    inputs: [StartEvent],
    outputs: [WorkflowEvent.or(ProceedToPaymentEvent, ShowShippingInformationFormEvent)],
  },
  async ({ data }, _) => {
    const user = await getUser(data.userId);
    if (user === null) {
      return new ShowShippingInformationFormEvent();
    }
    // todo
    return new ProceedToPaymentEvent();
  },
);

checkoutWorkflow.addStep(
  {
    inputs: [ShowShippingInformationFormEvent],
    outputs: [ProceedToPaymentEvent],
  },
  async ({ data }) => {
    const user = await getUser(data.userId);
    if (user === null) {
      data.update("TODO");
      data.interrupt();
    }
    return new ProceedToPaymentEvent();
  },
);

checkoutWorkflow.addStep(
  {
    inputs: [ProceedToPaymentEvent],
    outputs: [ConfirmOrderEvent],
  },
  async () => {
    return new ConfirmOrderEvent();
  },
);

checkoutWorkflow.addStep(
  {
    inputs: [ConfirmOrderEvent],
    outputs: [SendConfirmationEmailEvent],
  },
  async () => {
    return new SendConfirmationEmailEvent();
  },
);

checkoutWorkflow.addStep(
  {
    inputs: [SendConfirmationEmailEvent],
    outputs: [StopEvent<void>],
  },
  async () => {
    return new StopEvent(void 0);
  },
);

async function runContext(context: WorkflowContext<void, void, Context>) {
  try {
    await context;
  } catch (e) {
    console.log('e', e)
    const snapshot = context.snapshot();
    // for each step, save the snapshot into the local storage
    localStorage.setItem(
      "workflow-snapshot",
      new TextDecoder().decode(snapshot),
    );
  }
}

export const CheckoutDemo = () => {
  const items = [
    { name: "T-Shirt", price: 19.99, quantity: 2 },
    { name: "Jeans", price: 49.99, quantity: 1 },
    { name: "Sneakers", price: 79.99, quantity: 1 },
  ];

  const [ui, setUI] = useState<ReactNode>(null);

  const [contextData, setContextData] = useState<Context>({
    userId: "1",
    items: items,
    update: (ui) => setUI(ui),
    interrupt: () => {
      throw new Error("Interrupted");
    },
  });

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.1; // Assuming 10% tax
  const total = subtotal + tax;

  const onClickStartCheckout = useCallback(() => {
    const context = checkoutWorkflow.run().with(contextData);
    runContext(context);
  }, []);

  return (
    <div>
      {ui}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Your Order</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onClickStartCheckout}>
            Proceed to Checkout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
