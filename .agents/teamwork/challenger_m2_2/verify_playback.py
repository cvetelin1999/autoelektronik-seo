import cv2
import sys

def verify_playable_cv2(path):
    print(f"Testing playability and frame decoding for: {path}")
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        print("ERROR: cv2.VideoCapture failed to open file!")
        return False

    width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"Video properties: {int(width)}x{int(height)} @ {fps} fps, total frames: {total_frames}")

    decoded_frames = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        decoded_frames += 1

    cap.release()
    print(f"Successfully decoded {decoded_frames} frames out of {total_frames}.")
    if decoded_frames == total_frames and total_frames > 0:
        print("PASS: Video stream is 100% playable and all frames decode cleanly.")
        return True
    else:
        print("FAIL: Mismatch in decoded frame count!")
        return False

if __name__ == '__main__':
    v1 = 'public/videos/abs-module-repair-lab.mp4'
    v2 = 'dist/videos/abs-module-repair-lab.mp4'
    ok1 = verify_playable_cv2(v1)
    ok2 = verify_playable_cv2(v2)
    if ok1 and ok2:
        print("VIDEO PLAYABILITY TEST PASSED!")
    else:
        sys.exit(1)
