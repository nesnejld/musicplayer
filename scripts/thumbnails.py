import subprocess
import os
import sys
# Does not work on OSX - no convert


def runcommand(command):
    proc = subprocess.Popen(['bash', '-c', command],
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, stderr = proc.communicate()
    return [proc.returncode, output.decode("utf-8").strip(), stderr.decode("utf-8").strip() if stderr is not None else None]


def createthumbnail(file):
    thumbnail = os.path.join(os.path.dirname(
        file), '.thumbnails', os.path.basename(file))
    if not os.path.exists(thumbnail):
        command = f"""exif --tag=Orientation '{file}' | grep Value"""
        print(command)
        result = runcommand(command)
        if result[0] == 0:
            orientation = runcommand(command)[1].split('\n')[
                0].split(':')[1].strip()
            flip = ''
            if orientation == 'Bottom-right':
                flip = '-flip'
            command = f"""convert -thumbnail  "250x250" {
                flip} '{file}' '{thumbnail}'"""
            print(runcommand(command)[1].strip())
        else:
            print(f'EXIF information missing {file}:\n {result[2]}')


root = os.path.join(os.environ['HOME'], "Pictures")
command = f"find {root} -name '*.jpg' -o -name '*.JPG'"
result = runcommand(command)
if result[0] != 0:
    print(result[2])
files = result[1].split('\n')
for f in files:
    # print(f)
    dirname = os.path.dirname(f)
    if os.path.basename(dirname) == '.thumbnails':
        continue
    # print(dirname)
    thumbnails = os.path.join(dirname, ".thumbnails")
    if not os.path.exists(thumbnails):
        print(f"""making directory {thumbnails}""")
        command = f"""mkdir '{thumbnails}'"""
        runcommand(command)
    createthumbnail(f)

sys.exit(0)
