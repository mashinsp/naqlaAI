#!/usr/bin/env python3
"""
video_to_jpg.py — Extract frames from a video at 30 FPS and save as JPGs.

Usage:
    python video_to_jpg.py <video_file> [output_dir] [--fps 30] [--quality 95]

Requirements:
    pip install opencv-python
"""

import cv2
import os
import sys
import argparse
from pathlib import Path


def extract_frames(video_path: str, output_dir: str, fps: int = 30, quality: int = 95) -> None:
    """
    Extract frames from a video at the specified FPS and save as JPGs.

    Args:
        video_path: Path to the input video file.
        output_dir: Directory to save the extracted JPG frames.
        fps: Frames per second to extract (default: 30).
        quality: JPEG quality 0-100 (default: 95).
    """
    video_path = Path(video_path)
    if not video_path.exists():
        print(f"[ERROR] Video file not found: {video_path}")
        sys.exit(1)

    # Open video
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"[ERROR] Could not open video: {video_path}")
        sys.exit(1)

    # Video metadata
    source_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration_sec = total_frames / source_fps if source_fps > 0 else 0

    print(f"  Video     : {video_path.name}")
    print(f"  Resolution: {width}x{height}")
    print(f"  Source FPS: {source_fps:.2f}")
    print(f"  Duration  : {duration_sec:.2f}s  ({total_frames} total frames)")
    print(f"  Extract at: {fps} FPS")

    # Create output directory
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"  Output dir: {out_dir.resolve()}\n")

    # Calculate frame interval — how many source frames to skip between saves
    # e.g. source=60fps, target=30fps → save every 2nd frame
    frame_interval = max(1, round(source_fps / fps))

    saved = 0
    read = 0
    jpg_params = [cv2.IMWRITE_JPEG_QUALITY, quality]

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if read % frame_interval == 0:
            # Zero-padded filename: frame_000001.jpg, frame_000002.jpg …
            filename = out_dir / f"frame_{saved + 1:06d}.jpg"
            cv2.imwrite(str(filename), frame, jpg_params)
            saved += 1

            # Progress every 100 saved frames
            if saved % 100 == 0:
                pct = (read / total_frames * 100) if total_frames > 0 else 0
                print(f"  Saved {saved:,} frames  ({pct:.1f}% of source scanned)…")

        read += 1

    cap.release()

    effective_fps = saved / duration_sec if duration_sec > 0 else 0
    print(f"\n✅ Done! Saved {saved:,} frames (~{effective_fps:.1f} FPS) to: {out_dir.resolve()}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract frames from a video at a target FPS and save as JPGs."
    )
    parser.add_argument("video", help="Path to the input video file")
    parser.add_argument(
        "output_dir",
        nargs="?",
        default=None,
        help="Output directory (default: <video_name>_frames/ next to the video)",
    )
    parser.add_argument(
        "--fps",
        type=int,
        default=30,
        help="Target frames per second to extract (default: 30)",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=95,
        choices=range(0, 101),
        metavar="[0-100]",
        help="JPEG quality 0–100 (default: 95)",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    video_path = Path(args.video)
    output_dir = args.output_dir or str(video_path.parent / f"{video_path.stem}_frames")

    print("=" * 50)
    print("  Video → JPG Frame Extractor")
    print("=" * 50)

    extract_frames(
        video_path=str(video_path),
        output_dir=output_dir,
        fps=args.fps,
        quality=args.quality,
    )