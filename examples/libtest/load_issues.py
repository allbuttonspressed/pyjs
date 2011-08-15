import csv
import os
import urllib

URL = 'http://code.google.com/p/pyjamas/issues/csv?can=1&q=&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Summary'

ISSUES_MODULE = os.path.join(os.path.dirname(__file__), 'issues_list.py')

def main():
    data = urllib.urlopen(URL).read().replace('\r\n', '\n')
    data = [(item['ID'], item['Status'])
            for item in csv.DictReader(data.split('\n'))]
    issues = dict(data)

    content = 'issues = %r' % issues

    if os.path.exists(ISSUES_MODULE):
        fp = open(ISSUES_MODULE, 'r')
        is_unchanged = fp.read() == content
        fp.close()
        if is_unchanged:
            return

    print('Updating issues list')
    fp = open(ISSUES_MODULE, 'w')
    fp.write(content)
    fp.close()

if __name__ == '__main__':
    main()
