import glob, os

bio_block = '''
    <div class="author-bio fade-up">
      <p><strong>Daniel Fox</strong> is the founder of Entuned, where he builds music systems engineered for retail customer psychology. Background in music theory, behavioral research, and data-driven product design. <a href="../about.html">More about Daniel</a></p>
    </div>
'''

for f in sorted(glob.glob('_src/pages/blog-*/sections/01-content.html')):
    content = open(f, 'r').read()
    # Skip if author-bio already exists
    if 'author-bio' in content:
        continue
    # Insert before article-cta div
    if '<div class="article-cta' in content:
        content = content.replace('<div class="article-cta', bio_block + '\n    <div class="article-cta')
        open(f, 'w').write(content)
        print(f'  ✓ {os.path.basename(os.path.dirname(os.path.dirname(f)))}')

print('Done adding author bios.')
