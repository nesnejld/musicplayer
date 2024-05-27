#!/bin/env python
import sys
import os
from urllib.parse import urlparse, parse_qs, unquote
import subprocess
import traceback
# os.system("touch /tmp/mmmm")
#!/usr/bin/perl
print("Content-type: text/html\n\n")
# print(os.environ["QUERY_STRING"])
# print("<br/>")


def runcommand(command):
    p = subprocess.Popen(["bash", "-c", command],
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    output, errors = p.communicate()
    return {'command': command, 'stdout': output, 'stderr': errors}


try:
    command = parse_qs(os.environ["QUERY_STRING"])["command"][0]
    fields = parse_qs(os.environ["QUERY_STRING"])
    if "filename" in fields:
        filename = unquote(fields["filename"][0])
        filename = os.path.realpath(os.path.join(
            os.getcwd(), "../", filename))
    if command == 'env':
        for key in os.environ:
            print(f"""{key}={os.environ[key]}<br/>""")
            # print("\n")

    elif command == 'list':
        print(f"""filename: {filename}""")
        result = runcommand(f"""ls -l '{filename}'""")
        print(f"""output: {result["stdout"]}""")
        print(f"""errors: {result["stderr"]}""")
        print("<br/>")
    elif command == 'pwd':
        print(command)
        result = runcommand(command)
        print(f"""output: {result["stdout"]}""")
        print(f"""errors: {result["stderr"]}""")
        print("<br/>")
    elif command == 'delete':
        result = runcommand('whoami')
        print(f"""command: {result["command"]}""")
        print(f"""output: {result["stdout"]}""")
        print(f"""errors: {result["stderr"]}""")
        result = runcommand('groups')
        print(f"""command: {result["command"]}""")
        print(f"""output: {result["stdout"]}""")
        print(f"""errors: {result["stderr"]}""")
        command = f"""mv '{filename}' /tmp"""
        result = runcommand(command)
        print(f"""command: {result["command"]}""")
        print(f"""output: {result["stdout"]}""")
        print(f"""errors: {result["stderr"]}""")
        print("<br/>")
        pass
except Exception as e:
    print('Exception')
    traceback.print_exc(file=sys.stdout)
    print(os.getcwd())
    print(e)
