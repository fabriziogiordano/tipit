ffmpeg -i tipit.mp4 -filter:v "crop=in_w:in_h-100:0:100" tipit.cropped.mp4

ffmpeg -i tipit.cropped.mp4 \
    -vf "fps=10,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
    -loop 0 tipit.cropped.gif