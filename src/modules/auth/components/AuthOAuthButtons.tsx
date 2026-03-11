import { Button } from '@/components/ui/button';
import { GoogleIcon, LinkedInIcon, MicrosoftIcon } from './OAuthIcons';

const providers = [
  { name: 'Google', Icon: GoogleIcon },
  { name: 'Microsoft', Icon: MicrosoftIcon },
  { name: 'LinkedIn', Icon: LinkedInIcon },
] as const;

export function AuthOAuthButtons() {
  return (
    <div className="space-y-3">
      {providers.map(({ name, Icon }) => (
        <Button
          key={name}
          type="button"
          variant="outline"
          className="w-full h-12 justify-center gap-3"
        >
          <Icon />
          Continue with {name}
        </Button>
      ))}
    </div>
  );
}
