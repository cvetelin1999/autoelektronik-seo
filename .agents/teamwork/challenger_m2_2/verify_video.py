import os
import struct
import sys

def inspect_mp4(path):
    print(f"Inspecting MP4: {path}")
    if not os.path.exists(path):
        print(f"ERROR: File {path} does not exist!")
        return False
    size = os.path.getsize(path)
    print(f"File size: {size} bytes ({size / (1024*1024):.2f} MB)")
    if size == 0:
        print("ERROR: File size is 0 bytes!")
        return False

    with open(path, 'rb') as f:
        boxes = []
        while True:
            header = f.read(8)
            if len(header) < 8:
                break
            box_size, box_type = struct.unpack('>I4s', header)
            box_name = box_type.decode('ascii', errors='replace')
            boxes.append((box_name, box_size))
            if box_size == 1:
                box_size = struct.unpack('>Q', f.read(8))[0] - 16
                f.seek(box_size, os.SEEK_CUR)
            elif box_size == 0:
                break
            else:
                f.seek(box_size - 8, os.SEEK_CUR)
        print("Discovered MP4 top-level boxes:", boxes)
        box_names = [b[0] for b in boxes]
        if 'ftyp' in box_names and ('moov' in box_names or 'mdat' in box_names):
            print("SUCCESS: Valid ISO/IEC 14496-12 MP4 container structure confirmed.")
            return True
        else:
            print("ERROR: Not a standard MP4 box layout!")
            return False

def main():
    p1 = os.path.abspath('public/videos/abs-module-repair-lab.mp4')
    p2 = os.path.abspath('dist/videos/abs-module-repair-lab.mp4')
    poster1 = os.path.abspath('public/images/video-repair-thumbnail.svg')
    poster2 = os.path.abspath('dist/images/video-repair-thumbnail.svg')

    print("--- Public Video ---")
    ok1 = inspect_mp4(p1)
    print("\n--- Dist Video ---")
    ok2 = inspect_mp4(p2)

    print("\n--- Poster Check ---")
    poster1_ok = os.path.exists(poster1) and os.path.getsize(poster1) > 0
    poster2_ok = os.path.exists(poster2) and os.path.getsize(poster2) > 0
    print(f"Public poster exists: {poster1_ok} ({os.path.getsize(poster1) if os.path.exists(poster1) else 0} bytes)")
    print(f"Dist poster exists: {poster2_ok} ({os.path.getsize(poster2) if os.path.exists(poster2) else 0} bytes)")

    if not (ok1 and ok2 and poster1_ok and poster2_ok):
        print("\nVIDEO VERIFICATION FAILED!")
        sys.exit(1)
    else:
        print("\nVIDEO VERIFICATION PASSED 100%!")

if __name__ == '__main__':
    main()
