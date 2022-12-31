import os
import pandas as pd
import re
DIR = os.getcwd()


def getsong(f):
    return os.path.splitext(re.sub(r'^[0-9]+ (- )?', '', re.sub(r'^Disc [1-9] - ', '', f)))[0]


# print('1')
# print(getsong( '05 - Many a Mile to Freedom.mp3'))
# print(getsong( '05 Many a Mile to Freedom.mp3'))
# print(os.getcwd())
# os.chdir('/Users/djensen')
# os.listdir('Music')


def allfiles(dir):
    ff = []
    for f in os.listdir(dir):
        if f == '.DS_Store':
            continue
        fff = os.path.join(dir, f)
        if os.path.isdir(fff):
            #             print(f"""{f} is a directory""")
            ff.extend(allfiles(fff))
        else:
            #             print(f"""{f} is a file""")
            row = [getsong(f), os.path.abspath(fff)]
            parts = fff.split('/')
            parts.pop(0)
            row.extend(parts)
            if len(row) == 5:
                ff.append(row)
    return ff


def rrow(r, dir):
    r.append(dir)
    return r


#
# Workflow is to reduce duplicate albums using dupicatealbums.csv annd then
# remove duplicate songs using songs.csv
#
os.chdir('/Users/djensen/')
files = list(map(lambda r: rrow(r, 'Music'), allfiles('Music')))
os.chdir('/Users/djensen/Music')
files.extend(
    list(map(lambda r: rrow(r, 'Music/Music'), allfiles('Music'))))
os.chdir('/Users/djensen')
files.extend(
    list(map(lambda r: rrow(r, 'ScannedMusic'), allfiles('ScannedMusic'))))
artistalbums = {}
ARTIST = 2
ALBUM = 3
ROOT = 5
for f in files:
    key = (f[ARTIST], f[ALBUM])
    if key not in artistalbums:
        artistalbums[key] = []
    if f[ROOT] not in artistalbums[key]:
        artistalbums[key].append(f[ROOT])
f = files[0]
rows = []
for r in artistalbums:
    if len(artistalbums[r]) == 1:
        continue
    for k in artistalbums[r]:
        rows.append([r[0], r[1], k])
# rows = [[r[0], r[1], k] for r in artistalbums for k in artistalbums[r]]
os.chdir(DIR)
pd.DataFrame(rows, columns=['artist', 'album',
             'root']).to_csv('duplicatealbums.csv')
rows = []
for r in artistalbums:
    if len(artistalbums[r]) == 1 and 'Music' == artistalbums[r]:
        for k in artistalbums[r]:
            rows.append([r[0], r[1], k])
pd.DataFrame(rows, columns=['artist', 'album',
             'root']).to_csv('musiconly.csv')
duplicatesongs = list(filter(lambda f: len(
    artistalbums[(f[ARTIST], f[ALBUM])]) > 1, files))
# df = pd.DataFrame(
#     duplicates, columns=["song", "path", "artist", "album", "file", "root"])
df = pd.DataFrame(
    files, columns=["song", "path", "artist", "album", "file", "root"])
df = df[["artist", "album", "song",  "root", "file", "path"]]
df.sort_values(by=["artist", "album", "song"]).to_csv('songs.csv')
