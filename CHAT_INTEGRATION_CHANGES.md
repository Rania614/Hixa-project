# تغييرات نظام الرسائل - Chat Integration Changes

## ملخص التغييرات

تم تحديث نظام الرسائل لدعم رؤية الأدمن لجميع غرف الدردشة مباشرة حسب الدليل المقدم.

## التغييرات المنفذة

### 1. تحديث `messagesApi.ts`

#### إضافة Interface محدثة:
- تحديث `ChatRoomParticipant` لدعم `user` كـ string أو object (populated)
- تحديث `ChatRoom` لدعم `project` و `projectRoom` كـ string أو object (populated)

#### إضافة Function جديد:
```typescript
getAllChatRooms(): Promise<ChatRoom[]>
```
- يجلب جميع غرف الدردشة في النظام
- Endpoint: `GET /api/chat-rooms`
- للأدمن فقط - يرى جميع ChatRooms

### 2. تحديث `AdminMessages.tsx`

#### إضافة State جديد:
- `filter`: 'all' | 'client' | 'engineer' - فلتر حسب نوع المحادثة
- `viewMode`: 'all' | 'project' - وضع العرض (جميع المحادثات أو حسب المشروع)

#### إضافة Functions جديدة:
- `loadAllChatRooms()`: جلب جميع غرف الدردشة مباشرة
- `getProjectTitle()`: استخراج عنوان المشروع من ChatRoom

#### تحديث UI:
- إضافة View Mode Toggle (جميع المحادثات / حسب المشروع)
- إضافة Filter Buttons (الكل / العملاء / المهندسين)
- عرض عنوان المشروع في قائمة المحادثات عند استخدام وضع "جميع المحادثات"
- دعم عدد الرسائل غير المقروءة من `useUnreadMessagesCount`

### 3. الميزات الجديدة

#### للأدمن:
1. ✅ رؤية جميع ChatRooms مباشرة بدون الحاجة لاختيار Project Room
2. ✅ فلترة حسب النوع (client/engineer)
3. ✅ عرض معلومات المشروع في كل ChatRoom
4. ✅ عدد الرسائل غير المقروءة لكل ChatRoom
5. ✅ البحث في جميع المحادثات

#### Flow للأدمن:
```
1. تسجيل الدخول كأدمن
   ↓
2. اختيار View Mode: "All Chats" أو "By Project"
   ↓
3. إذا "All Chats":
   - GET /api/chat-rooms → جميع ChatRooms
   - فلترة حسب النوع (client/engineer)
   ↓
4. إذا "By Project":
   - GET /api/project-rooms → جميع ProjectRooms
   - اختيار Project Room
   - GET /api/chat-rooms/project-room/:roomId → ChatRooms للمشروع
   ↓
5. اختيار ChatRoom
   ↓
6. GET /api/messages/room/:roomId → الرسائل
   ↓
7. WebSocket → استقبال الرسائل الجديدة
```

## API Endpoints المستخدمة

### Chat Rooms:
- `GET /api/chat-rooms` - جلب جميع غرف الدردشة (للأدمن)
- `GET /api/chat-rooms/project-room/:roomId` - جلب غرف Project Room محدد
- `GET /api/chat-rooms/:roomId` - جلب غرفة محددة

### Messages:
- `GET /api/messages/room/:roomId` - جلب رسائل غرفة
- `POST /api/messages` - إرسال رسالة
- `GET /api/messages/unread/count` - عدد الرسائل غير المقروءة
- `PUT /api/messages/:messageId` - تحديث رسالة
- `DELETE /api/messages/:messageId` - حذف رسالة
- `PATCH /api/messages/:messageId/read` - تحديد كمقروءة
- `POST /api/messages/:messageId/reaction` - إضافة/إزالة تفاعل
- `GET /api/messages/search` - البحث في الرسائل

## WebSocket Events

- `new_message` - رسالة جديدة
- `message_updated` - رسالة محدثة
- `message_deleted` - رسالة محذوفة
- `reaction_updated` - تفاعل محدث
- `user_typing` - مؤشر الكتابة

## ملاحظات مهمة

1. **الصلاحيات:**
   - الأدمن يرى جميع ChatRooms في النظام
   - الأدمن يمكنه الوصول لأي ChatRoom حتى لو لم يكن participant
   - الأدمن يمكنه إرسال رسائل في أي ChatRoom

2. **البيانات:**
   - `project` و `projectRoom` يمكن أن تكون string (ID) أو object (populated)
   - `participants[].user` يمكن أن يكون string (ID) أو object (populated)
   - يجب التحقق من النوع قبل الوصول للخصائص

3. **الأداء:**
   - `getAllChatRooms()` يجلب جميع ChatRooms دفعة واحدة
   - قد يكون بطيئاً إذا كان هناك عدد كبير من ChatRooms
   - يمكن إضافة pagination في المستقبل

## الاختبار

### للاختبار:
1. تسجيل الدخول كأدمن
2. الانتقال إلى صفحة Messages
3. اختيار "All Chats" من View Mode
4. التحقق من ظهور جميع ChatRooms
5. تجربة الفلترة (All/Clients/Engineers)
6. اختيار ChatRoom والتحقق من الرسائل
7. إرسال رسالة والتحقق من استقبالها عبر WebSocket

## الملفات المعدلة

- `src/services/messagesApi.ts` - إضافة getAllChatRooms وتحديث interfaces
- `src/pages/admin-dashboard/AdminMessages.tsx` - إضافة View Mode و Filter و دعم getAllChatRooms

