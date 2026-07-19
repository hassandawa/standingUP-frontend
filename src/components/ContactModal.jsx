import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { submitContactMessage } from '../services/api.js';
import { getSession } from '../services/storage.js';

export default function ContactModal({ open, onClose, defaultSubject = '', defaultMessage = '' }) {
  const session = getSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [email, setEmail] = useState(session?.user?.email || '');
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setSubject(defaultSubject);
      setMessage(defaultMessage);
      setStatus('idle');
      setError('');
    }
  }, [open, defaultSubject, defaultMessage]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      await submitContactMessage({ name, email, subject, message });
      setStatus('sent');
    } catch (err) {
      setError(err.message || 'Failed to send. Please try again.');
      setStatus('error');
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#F5F3EE] border-2 border-[#0A0A0A] p-6 relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:opacity-60">
              <X className="h-5 w-5" />
            </button>

            {status === 'sent' ? (
              <div className="py-6 text-center">
                <p className="text-lg font-black uppercase tracking-tight mb-2">Message sent!</p>
                <p className="text-xs text-[#3A3A3A]">Thanks for reaching out — we'll get back to you soon.</p>
                <button
                  onClick={onClose}
                  className="mt-6 w-full h-11 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest hover:bg-transparent hover:text-[#0A0A0A] transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Get in touch</p>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Contact Us</h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A]">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full h-10 border-2 border-[#0A0A0A] bg-white px-3 text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full h-10 border-2 border-[#0A0A0A] bg-white px-3 text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A]">Subject</label>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1 w-full h-10 border-2 border-[#0A0A0A] bg-white px-3 text-sm"
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A]">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="mt-1 w-full border-2 border-[#0A0A0A] bg-white px-3 py-2 text-sm resize-none"
                      placeholder="Tell us what's going on..."
                    />
                  </div>
                </div>

                {error && <p className="mt-3 text-xs font-bold text-red-700">{error}</p>}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-5 w-full h-11 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest hover:bg-transparent hover:text-[#0A0A0A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {status === 'sending' ? 'Sending…' : (<><Send className="h-3.5 w-3.5" /> Send Message</>)}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
