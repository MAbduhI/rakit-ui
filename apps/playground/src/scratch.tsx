import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@rakit-ui/ui";
import { useState } from "react";
import { Section } from "./section";

/**
 * Your scratch space — this file exists to be rewritten.
 *
 * Throw whatever you are working on in here, hit save, and the browser updates.
 * Nothing else imports it, so it can never break the rest of the app.
 */
export function Scratch() {
  const [email, setEmail] = useState("");

  return (
    <Section title="Scratch" description="apps/playground/src/scratch.tsx — edit freely, this is yours.">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Sign in <Badge variant="secondary">beta</Badge>
          </CardTitle>
          <CardDescription>A throwaway example to start from.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button disabled={email.length === 0}>Continue</Button>
        </CardContent>
      </Card>
    </Section>
  );
}
