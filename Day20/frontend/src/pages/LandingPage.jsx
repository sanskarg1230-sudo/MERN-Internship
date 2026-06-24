import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlayCircle, Award, Users, BookOpen } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-32 lg:px-8 max-w-7xl mx-auto">
        {/* Background blobs */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}></div>
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              🚀 Launching the future of learning
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl"
          >
            Master your skills with <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">LMS Pro</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-slate-600 dark:text-zinc-300"
          >
            An enterprise-grade learning platform designed for ambitious students and top-tier instructors. Elevate your learning experience with interactive courses, real-time feedback, and globally recognized certificates.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Link to="/register" className="rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-500 hover:scale-105 transition-all duration-200">
              Get started for free
            </Link>
            <Link to="/courses" className="flex items-center gap-2 text-base font-semibold leading-6 text-slate-900 dark:text-white hover:text-primary-600 transition-colors">
              Explore Courses <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-zinc-900/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">Deploy faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Everything you need to succeed</p>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-zinc-300">
              Our platform offers a complete suite of tools to manage, track, and enhance your learning journey with absolute ease.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                { name: 'Expert Instructors', description: 'Learn from industry leaders with years of practical experience and deep knowledge.', icon: Users },
                { name: 'Interactive Quizzes', description: 'Test your knowledge instantly with our built-in quizzes and practical assignments.', icon: BookOpen },
                { name: 'Earn Certificates', description: 'Get verifiable certificates upon completion to showcase on your portfolio and LinkedIn.', icon: Award },
              ].map((feature, index) => (
                <motion.div 
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="flex flex-col p-8 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 hover:shadow-xl transition-shadow"
                >
                  <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-slate-900 dark:text-white">
                    <feature.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-zinc-300">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
