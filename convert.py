#!/usr/bin/env python
import sys
import os
import subprocess
def runcommand(command):
    p = subprocess.Popen(["bash", "-c", command],
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    output, errors = p.communicate()
    return {'command': command, 'stdout': output, 'stderr': errors}
l=list(filter(lambda s: s.endswith(".aiff"),os.listdir(".")))
for ll in l:
    pre, ext = os.path.splitext(ll)
    command=f"""ffmpeg -i "{ll}" -f mp3 -acodec libmp3lame -ab 192000 -ar 44100 "{pre}.mp3" """
    print(command)
    result=runcommand(command)
    print(result['stdout'])
    print(result['stderr'])

