import os
import cv2

video_path = "public/videos/abs-module-repair-lab.mp4"
print(f"Checking {video_path}")
assert os.path.exists(video_path), "File does not exist"
size = os.path.getsize(video_path)
print(f"Size: {size:,} bytes ({size / (1024*1024):.2f} MB)")

cap = cv2.VideoCapture(video_path)
is_opened = cap.isOpened()
print(f"OpenCV can open: {is_opened}")

if is_opened:
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    duration = frame_count / fps if fps > 0 else 0
    print(f"Resolution: {int(width)}x{int(height)}")
    print(f"FPS: {fps}")
    print(f"Total Frames: {int(frame_count)}")
    print(f"Duration: {duration:.2f} seconds")

    # Read frames across the video: first, middle, last
    ret, frame0 = cap.read()
    print(f"Read frame 0: {ret}, shape: {frame0.shape if ret else 'N/A'}")
    
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(frame_count // 2))
    ret_mid, frame_mid = cap.read()
    print(f"Read frame {int(frame_count // 2)}: {ret_mid}, shape: {frame_mid.shape if ret_mid else 'N/A'}")
    
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(frame_count - 1))
    ret_last, frame_last = cap.read()
    print(f"Read frame {int(frame_count - 1)}: {ret_last}, shape: {frame_last.shape if ret_last else 'N/A'}")

    cap.release()
else:
    print("Failed to open with OpenCV!")
