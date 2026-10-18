import { spawn } from "child_process";
import { mkdir, access } from "fs/promises";
import { join } from "path";

type GenerateHlsOptions = {
    inputPath: string;
    outputDirectory: string;
};

export async function generateHls({
    inputPath,
    outputDirectory,
}: GenerateHlsOptions): Promise<string> {
    await mkdir(outputDirectory, { recursive: true });

    for (const rendition of ["1080p", "720p", "480p"]) {
        await mkdir(join(outputDirectory, rendition), {
            recursive: true,
        });
    }

    const filterComplex = [
        "[0:v:0]split=3[v1080in][v720in][v480in]",
        "[v1080in]scale=w=1920:h=1080:force_original_aspect_ratio=decrease:force_divisible_by=2[v1080]",
        "[v720in]scale=w=1280:h=720:force_original_aspect_ratio=decrease:force_divisible_by=2[v720]",
        "[v480in]scale=w=854:h=480:force_original_aspect_ratio=decrease:force_divisible_by=2[v480]",
    ].join(";");

    const args = [
        "-hide_banner",
        "-y",
        "-i", inputPath,

        "-filter_complex", filterComplex,

        "-map", "[v1080]",
        "-map", "0:a:0?",
        "-map", "[v720]",
        "-map", "0:a:0?",
        "-map", "[v480]",
        "-map", "0:a:0?",

        "-c:v", "libx264",
        "-preset", "veryfast",
        "-pix_fmt", "yuv420p",

        "-b:v:0", "5000k",
        "-maxrate:v:0", "5350k",
        "-bufsize:v:0", "7500k",

        "-b:v:1", "2800k",
        "-maxrate:v:1", "2996k",
        "-bufsize:v:1", "4200k",

        "-b:v:2", "1400k",
        "-maxrate:v:2", "1498k",
        "-bufsize:v:2", "2100k",

        "-c:a", "aac",
        "-b:a", "128k",

        "-f", "hls",
        "-hls_time", "6",
        "-hls_playlist_type", "vod",
        "-hls_flags", "independent_segments",
        "-master_pl_name", "master.m3u8",

        "-var_stream_map",
        "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p",

        "-hls_segment_filename",
        join(outputDirectory, "%v", "segment_%03d.ts"),

        join(outputDirectory, "%v", "index.m3u8"),
    ];

    await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", args, {
            stdio: "inherit",
            windowsHide: true,
        });

        ffmpeg.once("error", (error) => {
            reject(
                new Error(`Failed to start FFmpeg: ${error.message}`)
            );
        });

        ffmpeg.once("close", (code, signal) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(
                new Error(
                    `FFmpeg failed: exit code=${code}, signal=${signal}`
                )
            );
        });
    });

    const masterPlaylistPath = join(
        outputDirectory,
        "master.m3u8"
    );

    try {
        await access(masterPlaylistPath);
    } catch {
        throw new Error(
            "FFmpeg finished, but the master playlist was not found"
        );
    }

    return masterPlaylistPath;
}