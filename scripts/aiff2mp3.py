#!/usr/bin/env python
import sys
import os
import subprocess
import re


def runcommand(command):
    p = subprocess.Popen(["bash", "-c", command],
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    output, errors = p.communicate()
    return {'command': command, 'stdout': output, 'stderr': errors}


if False:
    ALBUM = 'Hot Tuna/First Pull Up, Then Pull Down [Live]/'
    ALBUM = 'Dan Hicks and The Hot Licks/Last Train To Hicksville/'
    ALBUM = 'Bob Dylan/Love & Theft [Disc 2]/'
    result = runcommand(
        f"""find "{os.environ["HOME"]}/Music/{ALBUM}" -name '*.aiff' """)
    songs = result['stdout'].split('\n')
    with open('commands.sh', 'w') as f:
        for s in songs:
            if len(s) == 0:
                continue
            print(s)
            ss = re.sub(r'\.aiff$', '.mp3', s)
            # ss = re.sub(r'.*/', '', ss)
            command = "ffmpeg -y -i " + \
                f'"{s}"' + " -f mp3 -acodec libmp3lame -ab 192000 -ar 44100 " + f'"{ss}"'
            # result = runcommand(command)
            f.write(command+'\n')
            pass
    # echo $SONG
    # ffmpeg -i "${HOME}/Music/${ALBUM}"'4 Want You To Know.aiff' -f mp3 -acodec libmp3lame -ab 192000 -ar 44100 track1.mp3
if True:
    result = runcommand(
        f"""find "{os.environ["HOME"]}/Music" -name '*.aiff' """)
    songs = result['stdout'].split('\n')
    for s in songs:
        command = f"""mv -v -f "{s}" ~/Music/aiff"""
        result = runcommand(command)
        print(result['stdout'])
    pass
