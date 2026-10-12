"""
test_upgraded_art.py
Prototype and visually verify the upgraded, masterclass generative vector art for Mythical Beasts.
Focuses on pure high-art illustration, rich gradients, layered anatomy, and zero UI text boxes.
"""

import os
import sys

def get_defs(p, s, g, d, eye_c, sky1, sky2, sky3):
    return f"""
  <defs>
    <!-- Sky Background Gradient -->
    <radialGradient id="sky-bg" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="{sky3}"/>
      <stop offset="55%" stop-color="{sky2}"/>
      <stop offset="100%" stop-color="{sky1}"/>
    </radialGradient>

    <!-- Celestial Moon/Sun Disk Gradient -->
    <radialGradient id="celestial-disk" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="{g}" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="{s}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="{d}" stop-opacity="0"/>
    </radialGradient>

    <!-- Body Shading Linear Gradients -->
    <linearGradient id="body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{g}"/>
      <stop offset="40%" stop-color="{p}"/>
      <stop offset="100%" stop-color="{d}"/>
    </linearGradient>

    <linearGradient id="wing-grad" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="{g}"/>
      <stop offset="50%" stop-color="{p}"/>
      <stop offset="100%" stop-color="{d}"/>
    </linearGradient>

    <linearGradient id="belly-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="{g}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="{s}" stop-opacity="0.7"/>
    </linearGradient>

    <radialGradient id="orb-grad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="25%" stop-color="{g}"/>
      <stop offset="65%" stop-color="{p}"/>
      <stop offset="100%" stop-color="{d}"/>
    </radialGradient>

    <!-- Glow & Lighting Filters -->
    <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="hyper-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" result="blur1"/>
      <feGaussianBlur stdDeviation="24" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
"""

print("Test defs ready")
