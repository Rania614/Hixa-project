import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Search, 
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  User,
  Briefcase
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

const AdminCommunication = () => {
  const { language } = useApp();

  // Sample conversation data
  const conversations = [
    { 
      id: '1', 
      name: 'John Smith',
      role: language === 'en' ? 'Engineer' : 'مهندس',
      project: language === 'en' ? 'Bridge Construction' : 'بناء الجسر',
      lastMessage: language === 'en' ? 'Can you review the latest blueprint?' : 'هل يمكنك مراجعة المخطط الأخير؟',
      time: '2h ago',
      unread: 3,
      avatar: 'JS'
    },
    { 
      id: '2', 
      name: 'Sarah Johnson',
      role: language === 'en' ? 'Client' : 'عميل',
      project: language === 'en' ? 'HVAC System Design' : 'تصميم نظام التكييف',
      lastMessage: language === 'en' ? 'The proposal looks good, let\'s proceed.' : 'العرض يبدو جيدًا، لنبدأ.',
      time: '4h ago',
      unread: 0,
      avatar: 'SJ'
    },
    { 
      id: '3', 
      name: 'Mike Chen',
      role: language === 'en' ? 'Engineer' : 'مهندس',
      project: language === 'en' ? 'Structural Analysis' : 'تحليل هيكلي',
      lastMessage: language === 'en' ? 'I\'ve completed the calculations.' : 'لقد أكملت الحسابات.',
      time: '1d ago',
      unread: 1,
      avatar: 'MC'
    },
    { 
      id: '4', 
      name: 'Emma Wilson',
      role: language === 'en' ? 'Client' : 'عميل',
      project: language === 'en' ? 'Electrical Plan' : 'خطة كهربائية',
      lastMessage: language === 'en' ? 'When can we schedule the inspection?' : 'متى يمكننا جدولة التفتيش؟',
      time: '1d ago',
      unread: 0,
      avatar: 'EW'
    },
    { 
      id: '5', 
      name: 'David Brown',
      role: language === 'en' ? 'Engineer' : 'مهندس',
      project: language === 'en' ? 'Plumbing System' : 'نظام السباكة',
      lastMessage: language === 'en' ? 'Waiting for your approval on the design.' : 'في انتظار موافقتك على التصميم.',
      time: '2d ago',
      unread: 0,
      avatar: 'DB'
    },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminTopBar />
        
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {language === 'en' ? 'Communication' : 'التواصل'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Manage conversations between engineers and clients'
                : 'إدارة المحادثات بين المهندسين والعملاء'}
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={language === 'en' ? "Search conversations..." : "البحث عن محادثات..."} 
                className="pl-10"
              />
            </div>
          </div>

          {/* Communication Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Active Conversations' : 'محادثات نشطة'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-cyan">
                  <MessageSquare className="h-5 w-5 text-cyan" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Unread Messages' : 'رسائل غير مقروءة'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-yellow-500">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Engineers Online' : 'مهندسين متصلين'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-green-500">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Clients Online' : 'عملاء متصلين'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-blue-500">
                  <User className="h-5 w-5 text-blue-500" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5</div>
              </CardContent>
            </Card>
          </div>

          {/* Conversations List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations Sidebar */}
            <Card className="glass-card lg:col-span-1">
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Conversations' : 'المحادثات'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div 
                      key={conversation.id} 
                      className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer border border-border/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {conversation.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{conversation.name}</h4>
                            <span className="text-xs text-muted-foreground">{conversation.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conversation.role}</p>
                          <p className="text-sm truncate">{conversation.project}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                            {conversation.unread > 0 && (
                              <span className="bg-cyan text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Window */}
            <Card className="glass-card lg:col-span-2 flex flex-col">
              <CardHeader className="border-b border-border">
                <CardTitle>
                  {language === 'en' ? 'Chat with John Smith' : 'الدردشة مع جون سميث'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan flex items-center justify-center text-white text-xs flex-shrink-0">
                      JS
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 max-w-[80%]">
                      <div className="font-medium text-sm">John Smith</div>
                      <p className="text-sm mt-1">
                        {language === 'en' 
                          ? 'Hi there! I wanted to discuss the blueprint updates for the bridge project. Can you review them by tomorrow?' 
                          : 'مرحبًا! أردت مناقشة تحديثات المخطط للجسر. هل يمكنك مراجعتها غدًا؟'}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">10:30 AM</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-cyan text-white rounded-lg p-3 max-w-[80%]">
                      <div className="font-medium text-sm">You</div>
                      <p className="text-sm mt-1">
                        {language === 'en' 
                          ? 'Sure, I can review them by tomorrow. Please send me the files.' 
                          : 'بالتأكيد، يمكنني مراجعتها غدًا. من فضلك أرسل لي الملفات.'}
                      </p>
                      <div className="text-xs text-cyan-light mt-1">10:32 AM</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground text-xs flex-shrink-0">
                      AD
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan flex items-center justify-center text-white text-xs flex-shrink-0">
                      JS
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 max-w-[80%]">
                      <div className="font-medium text-sm">John Smith</div>
                      <p className="text-sm mt-1">
                        {language === 'en' 
                          ? 'Great! I\'ll send them over now. Also, do you have any questions about the structural calculations?' 
                          : 'رائع! سأرسلها الآن. أيضًا، هل لديك أي أسئلة حول الحسابات الهيكلية؟'}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">10:35 AM</div>
                    </div>
                  </div>
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input 
                      placeholder={language === 'en' ? "Type your message..." : "اكتب رسالتك..."} 
                      className="flex-1"
                    />
                    <Button className="bg-cyan hover:bg-cyan-dark">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCommunication;