import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return <Skeleton what="Counting. Every figure here is read off the confirmations, not guessed." bars={5} />;
}
