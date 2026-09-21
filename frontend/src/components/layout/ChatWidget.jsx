import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Minus, RotateCcw, Paperclip, Send, 
  Package, Store, CheckCircle2, Truck, ArrowRight, ShieldCheck,
  AlertCircle, Loader2
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { allProducts } from '../../data/products';

// Helper to get or generate persistent Visitor ID
const getVisitorId = () => {
  try {
    let id = localStorage.getItem('vw_chat_visitor_id');
    if (!id) {
      id = 'VTM-' + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('vw_chat_visitor_id', id);
    }
    return id;
  } catch {
    return 'VTM-1001';
  }
};

export const ChatWidget = () => {
  const { user, showToast, setQuickViewProduct } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [chatView, setChatView] = useState('home'); // 'home' | 'conversation'
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [unreadAdminMessages, setUnreadAdminMessages] = useState(0);
  const [isResolved, setIsResolved] = useState(false);
  
  // Track order form state
  const [trackOrderNo, setTrackOrderNo] = useState('');
  const [trackEmail, setTrackEmail] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackErrors, setTrackErrors] = useState({ order: false, email: false, msg: '' });

  const visitorId = useRef(getVisitorId()).current;
  const messagesEndRef = useRef(null);

  // Quick Chips
  const quickPrompts = [
    'Track my order',
    'What are your shipping details?',
    'What is your return policy?',
    'What are your product sizing details?',
    'Do you offer Express Shipping'
  ];

  // 3 Fan Cards (Thor's Hammer, Vintage Armour, Wooden Shield)
  const fanCards = [
    {
      id: 'product-2',
      title: "Thor's Mjolnir War Hammer",
      image: '/All categories/All Products/product 2/1.jpeg',
      tilt: '-rotate-6'
    },
    {
      id: 'product-44',
      title: 'Vintage Knight Armour Suit',
      image: '/All categories/Vintage Armour & Suits/Product 44/1.jpeg',
      tilt: 'rotate-0 scale-105 z-10'
    },
    {
      id: 'product-5',
      title: 'Handmade Wooden Shield',
      image: '/All categories/All Products/product 5/1.jpeg',
      tilt: 'rotate-6'
    }
  ];

  // Load chat history for this visitor session
  const loadChatThread = async () => {
    try {
      const savedThreads = localStorage.getItem('vw_live_chat_threads');
      if (savedThreads) {
        const threads = JSON.parse(savedThreads);
        const myThread = threads.find(t => t.id === visitorId);
        if (myThread) {
          if (Array.isArray(myThread.messages) && myThread.messages.length > 0) {
            setMessages(myThread.messages);
            if (chatView === 'home') setChatView('conversation');
          }
          setIsResolved(Boolean(myThread.isResolved));
        }
      }
    } catch (e) {}

    // Cloudflare D1 Backend Sync for cross-device persistence
    try {
      const res = await fetch(`/api/chat?id=${encodeURIComponent(visitorId)}`);
      if (res.ok) {
        const remoteThread = await res.json();
        if (remoteThread && Array.isArray(remoteThread.messages) && remoteThread.messages.length > 0) {
          setMessages(prev => {
            if (remoteThread.messages.length >= prev.length) {
              return remoteThread.messages;
            }
            return prev;
          });
          setIsResolved(Boolean(remoteThread.isResolved));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadChatThread();
    window.addEventListener('vw_live_chat_updated', loadChatThread);
    window.addEventListener('storage', loadChatThread);

    const pollInterval = setInterval(loadChatThread, 4000);

    return () => {
      window.removeEventListener('vw_live_chat_updated', loadChatThread);
      window.removeEventListener('storage', loadChatThread);
      clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
    if (chatView === 'conversation') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatView]);

  // Sync to shared threads & Admin CRM
  const syncMessageToStore = (newMsgList, lastText) => {
    try {
      const savedThreads = localStorage.getItem('vw_live_chat_threads');
      const threads = savedThreads ? JSON.parse(savedThreads) : [];
      
      const isUserSignedIn = Boolean(user && (user.email || user.id));
      const customerEmail = isUserSignedIn ? (user.email || '').toLowerCase().trim() : '';
      const customerName = isUserSignedIn ? (user.name || user.email) : `Guest User #${visitorId}`;
      const customerId = isUserSignedIn ? (user.id || user.email) : `guest_${visitorId}`;

      const threadObj = {
        id: visitorId,
        name: isUserSignedIn ? customerName : `Guest User #${visitorId}`,
        email: isUserSignedIn ? customerEmail : `Guest User (${visitorId})`,
        isGuest: !isUserSignedIn,
        userEmail: customerEmail,
        userId: customerId,
        subject: `Live Chat: "${lastText.slice(0, 35)}..."`,
        lastMessage: lastText,
        lastUpdated: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        read: false,
        replied: false,
        isResolved: false, // sending a new message reopens/keeps conversation active
        priority: 'high',
        isLiveChat: true,
        messages: newMsgList
      };

      setIsResolved(false);

      const otherThreads = threads.filter(t => t.id !== visitorId);
      const updatedThreads = [threadObj, ...otherThreads];
      localStorage.setItem('vw_live_chat_threads', JSON.stringify(updatedThreads));

      // Also sync to vw_admin_messages so it appears seamlessly in CRM
      const savedAdminMsgs = localStorage.getItem('vw_admin_messages');
      const adminMsgs = savedAdminMsgs ? JSON.parse(savedAdminMsgs) : [];
      const otherAdminMsgs = adminMsgs.filter(m => m.id !== visitorId);
      const updatedAdminMsgs = [
        {
          id: visitorId,
          name: isUserSignedIn ? customerName : `Guest User #${visitorId}`,
          email: isUserSignedIn ? customerEmail : `Guest User (${visitorId})`,
          isGuest: !isUserSignedIn,
          userEmail: customerEmail,
          userId: customerId,
          subject: `Live Chat: "${lastText.slice(0, 35)}..."`,
          message: lastText,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          read: false,
          replied: false,
          isResolved: false,
          priority: 'high',
          isLiveChat: true,
          chatThreadId: visitorId
        },
        ...otherAdminMsgs
      ];
      localStorage.setItem('vw_admin_messages', JSON.stringify(updatedAdminMsgs));

      // Asynchronously push to Cloudflare D1 database so Admin sees it live across devices
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(threadObj)
      }).catch(err => console.warn('Chat server sync notice:', err));

      window.dispatchEvent(new Event('vw_live_chat_updated'));
      window.dispatchEvent(new Event('vw_messages_updated'));
    } catch (e) {}
  };

  // Re-sync identity if user signs in or out during session
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]?.text || 'Live Chat';
      syncMessageToStore(messages, lastMsg);
    }
  }, [user]);

  const handlePromptClick = (prompt) => {
    setChatView('conversation');
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      senderName: 'You',
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let botMsg = null;
    if (prompt === 'Track my order') {
      botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        senderName: 'Support Bot',
        type: 'track_order_form',
        text: 'To see your order status, please provide your order details.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } else if (prompt === 'What are your shipping details?' || prompt === 'Do you offer Express Shipping') {
      botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        senderName: 'Support Bot',
        text: 'We offer Free Worldwide Express Shipping on all orders over $200 USD! Orders are dispatched from our Roorkee artisan workshop with DHL / FedEx tracking.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } else if (prompt === 'What is your return policy?') {
      botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        senderName: 'Support Bot',
        text: 'We have a 30-Day Hassle-Free Return Policy. If you are not completely satisfied with your handcrafted vintage piece, contact us for a replacement or full refund.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        senderName: 'Support Bot',
        text: 'All our shields (24"), helmets (18-gauge standard adult fit), compasses (45-55mm), and walking sticks (36") have exact dimensions listed on their product pages.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    const updated = [...messages, userMsg, botMsg];
    setMessages(updated);
    syncMessageToStore(updated, prompt);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    setChatView('conversation');
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      senderName: 'You',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    const sentText = inputMessage.trim();
    setInputMessage('');

    // Sync to Admin live stream immediately
    syncMessageToStore(updated, sentText);

    // If first query, send instant warm acknowledgement
    if (messages.length === 0) {
      setTimeout(() => {
        const botAck = {
          id: Date.now() + 2,
          sender: 'bot',
          senderName: 'Artisan Support',
          text: 'Thanks for reaching out! Our Roorkee artisan team has received your message and an admin is reviewing your live inquiry right now.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => {
          const withAck = [...prev, botAck];
          syncMessageToStore(withAck, sentText);
          return withAck;
        });
      }, 600);
    }
  };

  const handleTrackSubmit = async (e) => {
    e?.preventDefault();
    const qOrder = (trackOrderNo || '').trim().toLowerCase().replace('#', '');
    const qEmail = (trackEmail || '').trim().toLowerCase();

    let hasErr = false;
    const errors = { order: false, email: false, msg: '' };

    if (!qOrder) {
      errors.order = true;
      hasErr = true;
    }
    if (!qEmail) {
      errors.email = true;
      hasErr = true;
    }

    if (hasErr) {
      errors.msg = 'Please enter both your Order Number and Email address.';
      setTrackErrors(errors);
      return;
    }

    if (!qEmail.includes('@') || !qEmail.includes('.')) {
      setTrackErrors({ order: false, email: true, msg: 'Please enter a valid email address.' });
      return;
    }

    setIsTracking(true);
    setTrackErrors({ order: false, email: false, msg: '' });

    try {
      let allOrders = [];
      try {
        const res = await fetch(`/api/orders?id=${encodeURIComponent(qOrder)}&email=${encodeURIComponent(qEmail)}`);
        if (res.ok) {
          allOrders = await res.json();
        }
      } catch (err) {}

      if (!Array.isArray(allOrders) || allOrders.length === 0) {
        try {
          const res = await fetch('/api/orders');
          if (res.ok) {
            allOrders = await res.json();
          }
        } catch (err) {}
      }

      if (!Array.isArray(allOrders) || allOrders.length === 0) {
        const saved = localStorage.getItem('vw_admin_orders');
        if (saved) allOrders = JSON.parse(saved);
      }

      // STRICT VALIDATION: BOTH Order ID AND Email MUST MATCH
      const found = Array.isArray(allOrders) ? allOrders.find(o => {
        const oId = (o.id || '').toLowerCase().replace('#', '').trim();
        const oEmail = (o.customer_email || o.customerEmail || '').toLowerCase().trim();
        return oId === qOrder && oEmail === qEmail;
      }) : null;

      setIsTracking(false);

      if (found) {
        setTrackErrors({ order: false, email: false, msg: '' });
        setTrackingResult({
          orderNumber: found.id,
          status: found.status || 'Processing',
          carrier: found.carrier || 'DHL Express Worldwide',
          tracking: found.tracking || 'Pending Live Assignment',
          items: found.items || 'Handcrafted Artisan Collectibles',
          total: found.total || 0,
          date: found.date || 'Today',
          eta: found.status === 'Delivered' ? 'Delivered' : (found.status === 'Shipped' ? '2 - 3 Business Days' : '3 - 5 Business Days'),
          location: found.status === 'Shipped' ? 'In Transit (Air Cargo Terminal DEL)' : 'Roorkee Artisan Workshop, India',
          destination: found.shippingAddress || found.shipping_address || found.country || 'Australia'
        });
        showToast('Order found! Live tracking details updated.', 'success');
      } else {
        // Highlight inputs red and show error message
        setTrackErrors({
          order: true,
          email: true,
          msg: 'No order found matching this Order Number and Email. Please verify both fields.'
        });
        showToast('Order not found. Please verify Order Number & Email.', 'error');
      }
    } catch (err) {
      setIsTracking(false);
      setTrackErrors({
        order: true,
        email: true,
        msg: 'Error checking order status. Please try again.'
      });
      showToast('Error checking order status. Please try again.', 'error');
    }
  };

  const handleOpenProduct = (prod) => {
    try {
      const savedProducts = (() => {
        try {
          const s = localStorage.getItem('vw_admin_products');
          return s ? JSON.parse(s) : allProducts;
        } catch {
          return allProducts;
        }
      })();

      const fullProd = savedProducts.find(p => String(p.id) === String(prod.id)) || allProducts.find(p => String(p.id) === String(prod.id)) || prod;
      
      if (setQuickViewProduct) {
        setQuickViewProduct(fullProd);
      }
      window.location.hash = `#product-${fullProd.id}`;
      showToast(`Viewing: ${fullProd.title}`);
    } catch (e) {}
  };

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 font-menu select-none">
      
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-white hover:bg-neutral-50 text-neutral-800 p-3.5 rounded-full shadow-2xl border border-neutral-200 transition-all hover:scale-105 group flex items-center justify-center cursor-pointer"
          aria-label="Open support chat"
          title="Chat with us"
        >
          <MessageSquare className="w-5 h-5 text-neutral-800 stroke-[1.8]" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
        </button>
      )}

      {/* Main Chat Modal */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] max-w-[390px] bg-white rounded-3xl shadow-2xl border border-neutral-200/90 overflow-hidden flex flex-col h-[580px] animate-fade-in">
          
          {/* Header */}
          <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b border-neutral-100 bg-white">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setChatView(chatView === 'home' ? 'conversation' : 'home');
                  setTrackingResult(null);
                }}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors cursor-pointer"
                title="Switch View"
              >
                <RotateCcw className="w-4 h-4 stroke-[1.8]" />
              </button>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-neutral-800">Support Live</span>
                {user ? (
                  <span className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-mono truncate max-w-[130px] border border-neutral-200" title={user.email}>
                    {user.name || user.email}
                  </span>
                ) : (
                  <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-200">
                    Guest
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* ================= VIEW 1: HOME VIEW ================= */}
          {chatView === 'home' && (
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col justify-between space-y-4">
              
              {/* Welcome text */}
              <div className="space-y-1 pt-1">
                <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                  <span>👋</span>
                  <span>Welcome to Azim Crafts</span>
                </h4>
                <p className="text-[11.5px] text-neutral-700 font-medium leading-relaxed">
                  We are here to help you. Message our artisan support team live below or email{' '}
                  <a href="mailto:contact@azimcrafts.com" className="font-semibold text-neutral-900 underline hover:text-[#ae2828]">contact@azimcrafts.com</a>
                </p>
              </div>

              {/* 3 Fan-Out Cards (Thor's Hammer, Vintage Armour, Wooden Shield) */}
              <div className="relative py-4 flex items-center justify-center my-auto min-h-[160px]">
                {fanCards.map((card, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOpenProduct(card)}
                    title={`View ${card.title}`}
                    className={`w-28 sm:w-32 bg-white rounded-xl p-2 shadow-md hover:shadow-xl border border-neutral-200/80 flex flex-col items-center justify-between transition-all duration-300 hover:scale-105 cursor-pointer text-left group ${card.tilt} ${
                      idx === 1 ? 'z-20 -my-2' : 'z-10'
                    }`}
                  >
                    <div className="w-16 h-16 rounded bg-neutral-50 flex items-center justify-center overflow-hidden mb-1.5 p-1 group-hover:scale-105 transition-transform">
                      <img
                        src={card.image}
                        alt={card.title}
                        loading="lazy"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[9.5px] font-semibold text-neutral-800 text-center leading-tight line-clamp-2 group-hover:text-black">
                      {card.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* Privacy disclaimer */}
              <p className="text-[10px] text-neutral-400 leading-tight text-left">
                Your messages are sent live to our master artisans in Roorkee for bespoke crafting and support.
              </p>

              {/* Quick Prompt Pill Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    className="bg-white border border-neutral-200 hover:border-neutral-400 text-neutral-800 hover:text-black text-[11px] font-medium px-3 py-1.5 rounded-full transition-all shadow-2xs text-left cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= VIEW 2: CONVERSATION VIEW ================= */}
          {chatView === 'conversation' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-neutral-50/50">
              {isResolved && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-center text-[11px] font-medium flex items-center justify-center gap-1.5 shadow-2xs animate-fade-in">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>This chat has been marked as resolved. Send a message anytime if you need more help!</span>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className="space-y-2">
                  
                  {/* Visitor Bubble */}
                  {m.sender === 'user' ? (
                    <div className="flex flex-col items-end">
                      <div className="bg-[#1b1a1a] text-white px-4 py-2.5 rounded-2xl rounded-br-xs max-w-[85%] shadow-2xs font-medium text-xs">
                        {m.text}
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-0.5 pr-1">
                        You • {m.time}
                      </span>
                    </div>
                  ) : m.sender === 'admin' ? (
                    /* Real Live Admin Reply Bubble */
                    <div className="flex flex-col items-start space-y-1 max-w-[92%] animate-fade-in">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#c8924b] pl-1">
                        <ShieldCheck size={12} />
                        <span>Azim Crafts Admin</span>
                      </div>

                      {m.product ? (
                        /* Interactive Product Card from Admin */
                        <div className="bg-white text-neutral-900 border-2 border-[#c8924b]/40 rounded-2xl rounded-tl-xs shadow-md p-3.5 space-y-3 max-w-[290px] text-left">
                          {m.text && (
                            <p className="text-xs text-neutral-800 font-medium leading-relaxed">
                              {m.text}
                            </p>
                          )}

                          <div 
                            onClick={() => handleOpenProduct(m.product)}
                            className="group bg-amber-50/50 hover:bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 transition-all cursor-pointer flex gap-2.5 items-center"
                          >
                            <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center p-1 shrink-0 group-hover:scale-105 transition-transform">
                              <img src={m.product.image} alt={m.product.title} className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-bold text-[#c8924b] uppercase tracking-wider block">
                                {m.product.categoryName || m.product.category || 'Handcrafted'}
                              </span>
                              <h5 className="text-[11.5px] font-bold text-neutral-900 line-clamp-2 leading-snug group-hover:text-[#c8924b] transition-colors">
                                {m.product.title}
                              </h5>
                              <span className="text-xs font-black text-neutral-900 block mt-0.5">
                                ${Number(m.product.price).toFixed(2)} USD
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenProduct(m.product)}
                            className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all hover:opacity-95 cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
                          >
                            <span>View Details &amp; Buy</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="bg-[#faecd7] text-neutral-900 border border-[#ebdcca] px-4 py-2.5 rounded-2xl rounded-bl-xs shadow-xs font-medium text-xs leading-relaxed">
                          {m.text}
                        </div>
                      )}

                      <span className="text-[10px] text-neutral-400 pl-1">
                        {m.time}
                      </span>
                    </div>
                  ) : (
                    /* Automated Bot Message */
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2 max-w-[92%]">
                        <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-neutral-800 font-medium text-xs leading-relaxed">
                            {m.text}
                          </p>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">
                            Support • {m.time}
                          </span>
                        </div>
                      </div>

                      {/* Track My Order Form */}
                      {m.type === 'track_order_form' && (
                        <div className="ml-8 bg-white rounded-2xl border border-neutral-200/90 shadow-md p-4 space-y-3.5 animate-fade-in">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#faecd7] flex items-center justify-center text-neutral-800 shrink-0">
                              <Package className="w-5 h-5 text-amber-900" />
                            </div>
                            <div>
                              <h5 className="font-bold text-neutral-900 text-xs leading-tight">
                                Track my order
                              </h5>
                              <p className="text-[11px] text-neutral-500">
                                Please provide your information.
                              </p>
                            </div>
                          </div>

                          {!trackingResult ? (
                            <form onSubmit={handleTrackSubmit} className="space-y-2.5">
                              <div>
                                <input
                                  type="text"
                                  placeholder="Order number (e.g. #VTM-55305)"
                                  value={trackOrderNo}
                                  onChange={(e) => {
                                    setTrackOrderNo(e.target.value);
                                    if (trackErrors.order) setTrackErrors(prev => ({ ...prev, order: false, msg: '' }));
                                  }}
                                  className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-none transition-all bg-white ${
                                    trackErrors.order
                                      ? 'border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/20 text-neutral-900'
                                      : 'border-neutral-300 focus:ring-1 focus:ring-black focus:border-black text-neutral-900'
                                  }`}
                                />
                              </div>

                              <div>
                                <input
                                  type="email"
                                  placeholder="Email address (e.g. customer@example.com)"
                                  value={trackEmail}
                                  onChange={(e) => {
                                    setTrackEmail(e.target.value);
                                    if (trackErrors.email) setTrackErrors(prev => ({ ...prev, email: false, msg: '' }));
                                  }}
                                  className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-none transition-all bg-white ${
                                    trackErrors.email
                                      ? 'border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/20 text-neutral-900'
                                      : 'border-neutral-300 focus:ring-1 focus:ring-black focus:border-black text-neutral-900'
                                  }`}
                                />
                              </div>

                              {trackErrors.msg && (
                                <div className="flex items-start gap-1.5 p-2 bg-red-50 border border-red-200 rounded-md text-[11px] text-red-700 font-medium animate-fade-in">
                                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{trackErrors.msg}</span>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setChatView('home');
                                    setTrackErrors({ order: false, email: false, msg: '' });
                                  }}
                                  className="py-2.5 border border-neutral-300 hover:bg-neutral-100 rounded-md text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={isTracking}
                                  className="py-2.5 bg-black hover:bg-neutral-800 disabled:bg-neutral-600 text-white rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  {isTracking ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Searching...</span>
                                    </>
                                  ) : (
                                    <span>Track my order</span>
                                  )}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="space-y-3 pt-1 animate-fade-in">
                              <div className="p-3.5 bg-neutral-900 text-white rounded-2xl border border-neutral-800 space-y-2.5 text-xs shadow-md">
                                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-amber-400 font-bold">📦</span>
                                    <strong className="text-white font-mono">{trackingResult.orderNumber}</strong>
                                  </div>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    trackingResult.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                    trackingResult.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}>
                                    {trackingResult.status}
                                  </span>
                                </div>

                                <div className="space-y-1 text-[11px] text-neutral-300">
                                  <p><strong className="text-white font-semibold">Items:</strong> {trackingResult.items}</p>
                                  <p><strong className="text-white font-semibold">Carrier:</strong> {trackingResult.carrier}</p>
                                  <p><strong className="text-white font-semibold">Tracking Waybill:</strong> <span className="font-mono text-amber-300 font-bold">{trackingResult.tracking}</span></p>
                                  <p><strong className="text-white font-semibold">Current Location:</strong> {trackingResult.location}</p>
                                  <p><strong className="text-white font-semibold">Est. Delivery:</strong> <span className="text-emerald-400 font-bold">{trackingResult.eta}</span></p>
                                  <p><strong className="text-white font-semibold">Destination:</strong> {trackingResult.destination}</p>
                                </div>

                                {trackingResult.tracking && trackingResult.tracking !== 'Pending Live Assignment' && (
                                  <a
                                    href={`https://www.dhl.com/en/express/tracking.html?AWB=${trackingResult.tracking}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center gap-1.5 bg-[#c8924b] hover:bg-[#b57f38] text-white text-[11px] font-bold py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                                  >
                                    <span>Track on DHL Portal &rarr;</span>
                                  </a>
                                )}
                              </div>

                              <button
                                onClick={() => setTrackingResult(null)}
                                className="w-full text-center text-xs text-neutral-600 hover:text-black font-semibold hover:underline cursor-pointer py-1"
                              >
                                Search Another Order
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Footer Input Bar */}
          <div className="p-3 border-t border-neutral-200 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about shields, armour, custom orders..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs bg-neutral-100 border border-transparent focus:border-neutral-400 focus:bg-white rounded-xl outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="w-9 h-9 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-30 text-white flex items-center justify-center transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};
