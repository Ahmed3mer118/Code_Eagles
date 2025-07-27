import React from "react";
import { motion } from "framer-motion";
import { Code2, BrainCog, Users, Layers3 } from "lucide-react";

const cards = [
  {
    icon: <Code2 className="w-8 h-8 text-indigo-600" />,
    title: "Real-World Projects",
    desc: "Learn by working on real-world projects that simulate the actual challenges you'll face in a professional environment — not just theory.",
  },
  {
    icon: <BrainCog className="w-8 h-8 text-green-600" />,
    title: "Integrating AI into Your Work",
    desc: "Discover how to use AI tools to enhance your workflow — from writing and optimizing code to debugging and problem-solving.",
  },
  {
    icon: <Users className="w-8 h-8 text-rose-600" />,
    title: "Collaborate with Other Tracks",
    desc: "Get hands-on experience working alongside Backend, Mobile, and DevOps teams — just like in real software companies.",
  },
  {
    icon: <Layers3 className="w-8 h-8 text-yellow-600" />,
    title: "Full Coverage of All Tech Tracks",
    desc: "Whether you're into Frontend, Backend, Mobile, or DevOps — we provide a strong foundation and practical training in every domain.",
  },
];

const WhyLearnWithUs = () => {
  return (
    <section className="bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          🚀 Why Learn with Code Eagles?
        </h2>
        <p className="text-lg text-gray-600 mb-10">
          At <strong>Code Eagles</strong>, we don’t just teach you how to code — we prepare you for the real job market.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
            >
              <div className="mb-3">{card.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
              <p className="text-gray-600">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-gray-700 mt-12 text-xl font-medium"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Join a platform that teaches you more than just code — it teaches you how to think like a professional developer.
        </motion.p>
      </div>
    </section>
  );
};

export default WhyLearnWithUs;
