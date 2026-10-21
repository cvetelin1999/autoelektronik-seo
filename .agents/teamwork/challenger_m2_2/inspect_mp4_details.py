import os
import struct

def parse_mp4_details(path):
    with open(path, 'rb') as f:
        data = f.read()

    # Major brand in ftyp
    ftyp_idx = data.find(b'ftyp')
    major_brand = data[ftyp_idx+4:ftyp_idx+8].decode('ascii', errors='replace')
    print(f"Major brand: {major_brand}")

    # Find avc1 or mp4v or hvc1 (video codec)
    has_avc1 = b'avc1' in data
    has_mp4a = b'mp4a' in data
    print(f"H.264/AVC stream (avc1) present: {has_avc1}")
    print(f"AAC audio stream (mp4a) present: {has_mp4a}")

    # Find mvhd (movie header) duration
    mvhd_idx = data.find(b'mvhd')
    if mvhd_idx != -1:
        # mvhd box: 4 size, 4 'mvhd', 1 version, 3 flags, 4 creation, 4 mod, 4 timescale, 4 duration (v0)
        version = data[mvhd_idx+8]
        if version == 0:
            timescale, duration = struct.unpack('>II', data[mvhd_idx+20:mvhd_idx+28])
            length_sec = duration / timescale if timescale else 0
            print(f"Timescale: {timescale}, Duration: {duration} ({length_sec:.2f} seconds)")

    # Find tkhd track width & height
    tkhd_idx = data.find(b'tkhd')
    if tkhd_idx != -1:
        # tkhd version
        ver = data[tkhd_idx+8]
        offset = tkhd_idx + (92 if ver == 0 else 104)
        width_fixed, height_fixed = struct.unpack('>II', data[offset:offset+8])
        width = width_fixed >> 16
        height = height_fixed >> 16
        print(f"Track resolution: {width}x{height}")

parse_mp4_details('public/videos/abs-module-repair-lab.mp4')
