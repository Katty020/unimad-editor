import React from 'react';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const BlockNoteEditor = dynamic(
  () => import('../src/components/BlockNoteEditor').then(mod => ({ default: mod.BlockNoteEditor })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <>
      <Head>
        <title>Unimad-Projectcard</title>
        <meta name="description" content="Advanced portfolio editor with custom project cards" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <BlockNoteEditor />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
            },
          }}
        />
      </div>
    </>
  );
}