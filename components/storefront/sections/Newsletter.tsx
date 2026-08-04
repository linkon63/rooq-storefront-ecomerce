'use client';

import { validateNewsletterForm } from '@/utils/validateNewsletterForm';
import { useState } from 'react';
import { toast } from '@/lib/sonner';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailValidation = validateNewsletterForm(email, agreed);

        if (!emailValidation.success) {
            setError(emailValidation.message);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message, { position: 'bottom-right' });
                setEmail('');
                setAgreed(false);
                setError('');

            } else {
                toast.info(data.message, { position: 'bottom-right' });
            }
        } catch (error) {
            toast.info('Network error. Please try again.', {
                position: 'bottom-right'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="w-full bg-[#0e1523] text-white lg:px-4">
            <div className="w-full max-w-[1737px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16">

                    {/* Left: Heading + Copy */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                            Subscribe Our Newsletter
                        </h2>
                        <p className="mt-4 sm:mt-5 md:mt-6 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0">
                            Subscribe to our newsletter to receive early discount, news, sales & promo information.
                        </p>
                    </div>

                    {/* Right: Form */}
                    <div className="w-full lg:justify-self-end lg:max-w-[720px]">
                        <form onSubmit={handleSubmit} className="w-full" noValidate>
                            <div className='relative'>
                            {/* Email + Button */}
                            <div className="flex flex-col sm:flex-row w-full items-stretch gap-3 sm:gap-4">
                                <label htmlFor="email" className="sr-only">Your E-mail</label>
                                <div className="relative flex-1">
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            setError('');
                                        }}
                                        className="h-14 sm:h-14 w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/60 border-2 border-white/30 focus:border-white focus:bg-white/15 focus:outline-none focus:ring-0  px-5 text-base transition-all duration-300"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-14 sm:h-14 shrink-0 bg-white text-[#0e1523] hover:bg-gray-100 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 px-8 sm:px-10 font-bold uppercase tracking-wide text-sm sm:text-base whitespace-nowrap cursor-pointer"
                                >
                                    {isLoading ? 'Subscribing...' : 'Subscribe'}
                                </button>
                            </div>

                            {/* Error Message */}
                            {
                                error && <div className="absolute -bottom-6 left-1 flex items-center gap-2 mt-2 px-1 animate-in fade-in slide-in-from-top-1 duration-300">
                                    {/* Warning Icon */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-4 h-4 text-red-500"
                                    >
                                        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                                    </svg>

                                    <span className="text-red-400 text-xs sm:text-sm font-medium tracking-wide">
                                        {error}
                                    </span>
                                </div>
                            }
                            </div>

                            {/* Checkbox */}
                            <div className="mt-6 sm:mt-6 md:mt-7 flex items-start gap-3">
                                <input
                                    id="agree"
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => {
                                        setAgreed(e.target.checked)
                                        setError('');
                                    }}
                                    className="h-5 w-5 mt-0.5 bg-gray-900 border-2 border-white cursor-pointer shrink-0"
                                />
                                <label htmlFor="agree" className="text-sm sm:text-sm md:text-base text-slate-300 leading-relaxed cursor-pointer">
                                    I agree to the{' '}
                                    <a href="#" className="text-white font-medium underline underline-offset-2 decoration-white/60 hover:decoration-white transition-all">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
