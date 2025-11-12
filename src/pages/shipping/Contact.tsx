import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Get in touch with our team for any questions or support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Phone</h3>
              <p className="text-muted-foreground text-sm mb-2">Call us anytime</p>
              <p className="font-medium">1-800-CW-EXPRESS</p>
              <p className="text-sm text-muted-foreground">(1-800-293-9773)</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-500/10 rounded-full mb-4">
                <Mail className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground text-sm mb-2">Send us a message</p>
              <p className="font-medium text-sm">info@cwexpress.com</p>
              <p className="font-medium text-sm">support@cwexpress.com</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-green-500/10 rounded-full mb-4">
                <MapPin className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Address</h3>
              <p className="text-muted-foreground text-sm mb-2">Main depot</p>
              <p className="font-medium text-sm">Las Vegas, NV</p>
              <p className="text-sm text-muted-foreground">Serving Western US</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full">Send Message</Button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <Clock className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Business Hours</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between gap-8">
                      <span>Monday - Friday:</span>
                      <span className="font-medium">8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between gap-8">
                      <span>Saturday:</span>
                      <span className="font-medium">9:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between gap-8">
                      <span>Sunday:</span>
                      <span className="font-medium">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Department Contacts</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">Customer Service</p>
                  <p className="text-muted-foreground">support@cwexpress.com</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Shipping Inquiries</p>
                  <p className="text-muted-foreground">shipping@cwexpress.com</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Claims Department</p>
                  <p className="text-muted-foreground">claims@cwexpress.com</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Freight & Logistics</p>
                  <p className="text-muted-foreground">freight@cwexpress.com</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Returns</p>
                  <p className="text-muted-foreground">returns@cwexpress.com</p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-muted">
              <h2 className="text-xl font-bold text-foreground mb-4">Emergency Support</h2>
              <p className="text-sm text-muted-foreground mb-2">
                For urgent shipping issues outside business hours:
              </p>
              <p className="font-medium">Emergency Hotline: 1-800-CW-URGENT</p>
              <p className="text-xs text-muted-foreground mt-2">
                Available 24/7 for active shipment emergencies
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
