import { TrackingEvent } from '@/types/shipping';
import { format } from 'date-fns';
import { Check, Circle } from 'lucide-react';

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export const TrackingTimeline = ({ events }: TrackingTimelineProps) => {
  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const isDelivered = event.status === 'delivered';
        
        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`rounded-full p-2 ${
                isDelivered ? 'bg-green-500' : 'bg-primary'
              }`}>
                {isDelivered ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Circle className="h-4 w-4 text-white" fill="currentColor" />
                )}
              </div>
              {!isLast && (
                <div className="w-0.5 h-full min-h-[40px] bg-border mt-2" />
              )}
            </div>
            
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{event.description}</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                  <div>{format(event.timestamp, 'MMM dd, yyyy')}</div>
                  <div>{format(event.timestamp, 'h:mm a')}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
