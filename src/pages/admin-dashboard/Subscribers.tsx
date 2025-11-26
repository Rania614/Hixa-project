import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Send, X } from 'lucide-react';

export const Subscribers = () => {
  const { content, language, updateContent, sendEmailBroadcast } = useApp();
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSubjectEn, setBroadcastSubjectEn] = useState('');
  const [broadcastSubjectAr, setBroadcastSubjectAr] = useState('');
  const [broadcastMessageEn, setBroadcastMessageEn] = useState('');
  const [broadcastMessageAr, setBroadcastMessageAr] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Safe access to subscribers with fallback to empty array
  const subscribers = content?.subscribers || [];

  const handleDeleteSubscriber = async (id: string) => {
    const updatedSubscribers = subscribers.filter(subscriber => subscriber.id !== id);
    await updateContent({ subscribers: updatedSubscribers });
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      await sendEmailBroadcast({
        subject: { en: broadcastSubjectEn, ar: broadcastSubjectAr },
        message: { en: broadcastMessageEn, ar: broadcastMessageAr }
      });
      
      setIsSending(false);
      setSendSuccess(true);
      
      // Reset form and close modal after 2 seconds
      setTimeout(() => {
        setSendSuccess(false);
        setShowBroadcastModal(false);
        setBroadcastSubjectEn('');
        setBroadcastSubjectAr('');
        setBroadcastMessageEn('');
        setBroadcastMessageAr('');
      }, 2000);
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      setIsSending(false);
    }
  };

  const totalSubscribers = subscribers.length;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminTopBar />
        
        <main className="flex-1 p-6 bg-background">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">
              {language === 'en' ? 'Subscribers' : 'المشتركون'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Manage platform subscribers and send broadcasts' 
                : 'إدارة مشتركي المنصة وإرسال البثوث'}
            </p>
          </div>
          
          {/* Stats Card */}
          <Card className="mb-6 glass-card">
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Subscriber Statistics' : 'إحصائيات المشتركين'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-2xl font-bold">{totalSubscribers}</h3>
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Total Subscribers' : 'إجمالي المشتركين'}
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-2xl font-bold">
                    {subscribers.filter(s => s.email).length}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Email Subscribers' : 'المشتركون عبر البريد الإلكتروني'}
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-2xl font-bold">
                    {subscribers.filter(s => s.phone).length}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Phone Subscribers' : 'المشتركون عبر الهاتف'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {language === 'en' ? 'Subscriber List' : 'قائمة المشتركين'}
            </h2>
            <Button 
              onClick={() => setShowBroadcastModal(true)}
              className="bg-gold hover:bg-gold-dark"
            >
              <Send className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Send Email Broadcast' : 'إرسال بث عبر البريد الإلكتروني'}
            </Button>
          </div>
          
          {/* Subscribers Table */}
          <Card className="glass-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold">
                        {language === 'en' ? 'Contact' : 'جهة الاتصال'}
                      </th>
                      <th className="text-left p-4 font-semibold">
                        {language === 'en' ? 'Join Date' : 'تاريخ الانضمام'}
                      </th>
                      <th className="text-left p-4 font-semibold">
                        {language === 'en' ? 'Actions' : 'الإجراءات'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length > 0 ? (
                      subscribers.map((subscriber) => (
                        <tr key={subscriber.id} className="border-b border-border hover:bg-secondary/30">
                          <td className="p-4">
                            {subscriber.email ? subscriber.email : subscriber.phone}
                          </td>
                          <td className="p-4">
                            {subscriber.joinDate}
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSubscriber(subscriber.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-muted-foreground">
                          {language === 'en' 
                            ? 'No subscribers yet' 
                            : 'لا يوجد مشتركون بعد'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl glass-card relative">
            <Button
              onClick={() => setShowBroadcastModal(false)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Send Email Broadcast' : 'إرسال بث عبر البريد الإلكتروني'}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {sendSuccess ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold mb-2">
                    {language === 'en' ? 'Success!' : 'نجحت العملية!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'Broadcast sent to all subscribers' 
                      : 'تم إرسال البث إلى جميع المشتركين'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendBroadcast} className="space-y-4">
                  <div>
                    <label htmlFor="subject-en" className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Subject (English)' : 'الموضوع (الإنجليزية)'}
                    </label>
                    <Input
                      id="subject-en"
                      value={broadcastSubjectEn}
                      onChange={(e) => setBroadcastSubjectEn(e.target.value)}
                      placeholder={language === 'en' ? 'Broadcast subject' : 'موضوع البث'}
                      className="bg-secondary/50"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject-ar" className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Subject (Arabic)' : 'الموضوع (العربية)'}
                    </label>
                    <Input
                      id="subject-ar"
                      value={broadcastSubjectAr}
                      onChange={(e) => setBroadcastSubjectAr(e.target.value)}
                      placeholder={language === 'en' ? 'Broadcast subject' : 'موضوع البث'}
                      className="bg-secondary/50"
                      required
                      dir="rtl"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message-en" className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Message (English)' : 'الرسالة (الإنجليزية)'}
                    </label>
                    <textarea
                      id="message-en"
                      value={broadcastMessageEn}
                      onChange={(e) => setBroadcastMessageEn(e.target.value)}
                      placeholder={language === 'en' ? 'Your message here...' : 'رسالتك هنا...'}
                      className="w-full h-32 p-3 bg-secondary/50 rounded-md border border-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message-ar" className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Message (Arabic)' : 'الرسالة (العربية)'}
                    </label>
                    <textarea
                      id="message-ar"
                      value={broadcastMessageAr}
                      onChange={(e) => setBroadcastMessageAr(e.target.value)}
                      placeholder={language === 'en' ? 'Your message here...' : 'رسالتك هنا...'}
                      className="w-full h-32 p-3 bg-secondary/50 rounded-md border border-input"
                      required
                      dir="rtl"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold"
                    disabled={isSending}
                  >
                    {isSending 
                      ? (language === 'en' ? 'Sending...' : 'إرسال...') 
                      : (language === 'en' ? 'Send to All Subscribers' : 'إرسال إلى جميع المشتركين')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Subscribers;