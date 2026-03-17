import { CalendarIcon, FileTextIcon } from '@radix-ui/react-icons';
import { BellIcon, Share2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Marquee } from '../ui/marquee';
import { BentoCard, BentoGrid } from '../ui/bento-grid';
import { AnimatedList } from '../ui/animated-list';
import { AnimatedBeamMultipleOutputDemo } from './AnimatedBeamMultipleOutput';

const files = [
  {
    name: 'bitcoin.pdf',
    body: 'Bitcoin is a cryptocurrency invented in 2008 by an unknown person or group of people using the name Satoshi Nakamoto.',
  },
  {
    name: 'finances.xlsx',
    body: 'A spreadsheet or worksheet is a file made of rows and columns that help sort data, arrange data easily, and calculate numerical data.',
  },
  {
    name: 'logo.svg',
    body: 'Scalable Vector Graphics is an Extensible Markup Language-based vector image format for two-dimensional graphics with support for interactivity and animation.',
  },
  {
    name: 'keys.gpg',
    body: 'GPG keys are used to encrypt and decrypt email, files, directories, and whole disk partitions and to authenticate messages.',
  },
  {
    name: 'seed.txt',
    body: 'A seed phrase, seed recovery phrase or backup seed phrase is a list of words which store all the information needed to recover Bitcoin funds on-chain.',
  },
];

interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

let notifications = [
  {
    name: 'Payment received',
    description: 'Magic UI',
    time: '15m ago',

    icon: '💸',
    color: '#00C9A7',
  },
  {
    name: 'User signed up',
    description: 'Magic UI',
    time: '10m ago',
    icon: '👤',
    color: '#FFB800',
  },
  {
    name: 'New message',
    description: 'Magic UI',
    time: '5m ago',
    icon: '💬',
    color: '#FF3D71',
  },
  {
    name: 'New event',
    description: 'Magic UI',
    time: '2m ago',
    icon: '🗞️',
    color: '#1E86FF',
  },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        'relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4',
        // animation styles
        'transition-all duration-200 ease-in-out hover:scale-[103%]',
        // light styles
        'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
        // dark styles
        'transform-gpu dark:bg-transparent dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)]',
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center text-lg font-medium whitespace-pre dark:text-white">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">{description}</p>
        </div>
      </div>
    </figure>
  );
};

export function AnimatedListDemo({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex h-[500px] w-full flex-col overflow-hidden p-2', className)}>
      <AnimatedList>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>

      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t"></div>
    </div>
  );
}

const features = [
  {
    Icon: FileTextIcon,
    name: 'Save your files',
    description: 'We automatically save your files as you type.',
    href: '#',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-1',
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              'relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4',
              'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
              'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
              'transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none',
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white">{f.name}</figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: BellIcon,
    name: 'Notifications',
    description: 'Get notified when something happens.',
    href: '#',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-2',
    background: (
      <AnimatedListDemo className="absolute top-4 right-2 h-[300px] w-full scale-75 border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90" />
    ),
  },
  {
    Icon: Share2Icon,
    name: 'Integrations',
    description: 'Supports 100+ integrations and counting.',
    href: '#',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-2',
    background: (
      <AnimatedBeamMultipleOutputDemo className="absolute top-4 right-2 h-[300px] border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-105" />
    ),
  },
  {
    Icon: CalendarIcon,
    name: 'Calendar',
    description: 'Use the calendar to filter your files by date.',
    className: 'col-span-3 lg:col-span-1',
    href: '#',
    cta: 'Learn more',
    background: (
      <Calendar
        mode="single"
        selected={new Date(2022, 4, 11, 0, 0, 0)}
        className="absolute top-10 right-0 origin-top scale-75 rounded-md border [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90"
      />
    ),
  },
];

export function BentoGridAlpha() {
  return (
    <section className="bg-background py-20 md:py-28 px-6">
      <div className="max-w-7xl mx-auto">
        {/*  <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-14">
          Built for modern teams
        </h2> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 py-10 items-start">
          <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-semibold text-foreground leading-[1.15] tracking-tight">
            Your GTM team,
            <br /> always on
          </h2>

          <div>
            <p className="font-body text-muted-foreground text-lg md:text-xl leading-relaxed">
              Deploy AI agents that don't just suggest next steps — they take them. Run
              multi-channel sequences, respond to signals, and hand off to humans exactly when it
              matters.
            </p>
          </div>
        </div>

        <BentoGrid>
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
