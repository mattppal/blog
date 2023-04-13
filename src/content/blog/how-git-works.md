---
author: Matt Palmer
description: ''
draft: false
featured: false
ogImage: ''
postSlug: how-git-works
pubDatetime: 2021-03-01 00:00:00
tags: []
title: How Git works.
---

### Notes 

1. This is a pretty rough/unpolished guide I wrote while following a [Udemy course](https://www.udemy.com/course/git-and-github-complete-guide/). I found the first half of the course to be very helpful and interesting, while the latter half was a bit longwinded and unnecessary. For anyone that wants a fundamental understanding of Git, I think it's of great value.
2. Here's a really cool interactive Git tool: [https://learngitbranching.js.org/](https://learngitbranching.js.org/)

### (Brief) Introduction to Shell

- The _Terminal_ is just a graphical user interface that grants access to the _shell._ The default shell on Mac is _Bash_ the default shell on Windows is _PowerShell_. The shell is a program that takes keyboard commands and passes them to the OS to be executed.
- Not going to delve into the shell too much here, but it allows us to interact with Git. Check out _The Linux Command Line— A Complete Introduction_ by William Shotts for all you could every want to know about the shell.

- iTerm is a custom terminal for MacOS. ZSH is a custom shell for MacOS. oh my zsh is a framework for managing custom shells. Besides looking better, these tools can be used to customize and improve the functionality of the user's terminal & shell.

- Basic shell commands (many more in the book)
  - mkdir - make directory
  - ls - list files and directories
  - cd - change directory
  - . - alias of current directory
  - .. - alias of parent directory
  - nano - edit file
  - clear - clear terminal
  - Tab - autocomplete
  - echo - print to terminal
  - man - help on specific command
  - touch - create new file, change file permissions
  - \> - write to file
  - \>\> - append to file
  - cat - list contents of file
  - rm - remove files and directories

## Git under the hood

### Git vs. GitHub

**Git** is a distributed version-control system, it can track changes in files in any folder, called a _repository._ Really, it's just a special file system.

Git has it's own file structure in which each file is stored in a separate document with it's own hash. In that way, git is a persistent _hash map_ that stores key-value pairs— key = hash, value = content of file.

Git is designed to be used without an internet connection, but **Github** is used to manage local git repositories— it's a repository hosting service. Github allows the user to backup local repos, but also unlocks the potential for collaboration among teams.

### Initializing a new git repo

_git init_ serves to create an empty git repo with you can then add files to. Behind the scenes, a new hidden `.git` folder is created. Inside the hidden folder are a number of files and directories containing information relative to the repo.

![git/IMG_1.png](git/IMG_1.png)

Git has it's own file structure in which all information goes into the `objects` folder. There are four object types. These can be manipulated with low level commands like `git hash-object` and `git cat-file`.

- Blob

  Files. Any files with any extensions. Video, pictures, text, etc.

- Tree

  Directory information. Tree information may be a set of blobs or a set of blobs and other trees.

- Commit

  Commits, i.e. versions are stored in git.

- Annotated Tag

  Persistent text pointers which refer to specific commits.

A new object can be created with the command `git hash-object -w`. This creates a git object and writes it into a repository, where it can then be examined with `git cat-file`. The command `git mktree` is used to make new trees in a repo.

For example, the following commands initialize a new object— note how the different quotations generate the same string output.

![git/IMG_2.png](git/IMG_2.png)

No changes are present in the folder structure until the final command when `-w` is passed. Now, a new object exists. Note how this object is named: b7 + the rest of the string above. The string is what's known as a hash.

![git/IMG_3.png](git/IMG_3.png)

For git, the folder name + file name = hash. Hash is generated from file input.

### JSON vs. Git Databases

JSON (JavaScript Object Notation) is a common database format in programming where data is stored in key-value pairs. For example, in the following, the `id` key has a value of `file`.

```jsx
{"menu": {
  "id": "file",
  "value": "File",
  "popup": {
    "menuitem": [
      {"value": "New", "onclick": "CreateNewDoc()"},
      {"value": "Open", "onclick": "OpenDoc()"},
      {"value": "Close", "onclick": "CloseDoc()"}
    ]
  }
}}
```

Git databases also store key-value pairs, with the file hash as a key and the contents as a value. The difference comes from the fact that the _same hash can be generated from different inputs,_ as demonstrated from the screenshot above where "Hello, Git" & 'Hello, Git' returned the same hash.

### What is a Hash function?

A hash function is one that takes any, variable length input and returns a fixed length hash. In the example above, we passed a short string to generate a hash, but hashes can be generated for any size file from a few characters to large video files.

Thus, an important characteristic of the hash function is that **merely knowing the hash does not allow you to recursively generate inputs** (how could we rebuild a video from a limited fixed length string?) That is, hash functions are _one way functions_. That's why passwords are stored in hashes for many websites.

The other important characteristic of hash functions is that the same input will always produce the same hash. If you were to run the same command `echo "Hello, Git" | git hash-object --stdin`, you should return the same hash.

Another characteristic of hash functions is that even a small change, e.g. adding a `!`to the end of the string, will produce an entirely different hash. That's why hashes are one-way: you can't reverse-engineer input.

### Hash function overview.

- Common has functions you've probably heard of
  - MD5 - 128 bit
  - SHA1 - 160 bit
  - SHA256 - 256 bit
  - SHA384 - 384 bit
  - SHA512 - 512 bit

Git uses the SHA1 algorithm, which creates strings that are 160 bits long in hexadecimal format. Hexadecimal format contains the following characters `0123456789ABCDEF`, where capitalization is not considered. It is a _base 16_ representation, as compared to binary, which is base 2 (`01`).

By now, it may be apparent that there is some limit to the number of files that can be stored in the same repository— if a hash function generates a new output for any given input, the number of unique outputs must be limited by the different hash hexadecimal combinations. Two important questions are _How many files can one store in a Git repo?_ and _What is the probability of generating the same exact hash for different inputs?_

1. Given that a hash is a base 16 representation, the total number of combinations is equal to $2^{160} = 1.46 \times 10^{48}$, since SHA1 is _160 bits long_ which corresponds to the binary representation in which there are only two combinations, 0 & 1. So I think it's safe to say this isn't something to worry about. 🙂
2. For repeated trials of an event with the same probability, e.g. repeatedly rolling dice, probabilities must be multiplied to obtain an overall result. The odds of rolling two consecutive 6's is $\frac{1}{6} \times \frac{1}{6} = \frac{1}{36}$. For completeness, the probability of rolling numbers that differ, e.g. 4 & 5, we multiply the answer by two, since there are two outcomes in which we roll that pair (each die can take on a 4 or 5, respectively).

Given that we know the total number of SHA1 hashes, the calculation is similar. We must multiply two probabilities $2^{-160} \times 2^{-160} = 2^{-320} = 4.68 \times 10^{-97}$. It's safe to say that we don't have to worry about this either.

- Basic _git cat-file_ options

  `git cat-file -p <hash>` - contents of object

  `git cat-file -s <hash>` - size of object

  `git cat-file -t <hash>` - type of object

- Basic _git hash-object_ options

  `git hash-object <file> -w` - write a file to the repo

### Contents of Git objects

![git/IMG_4.png](git/IMG_4.png)

- Each blob stored in an objects folder has a name, but that name is derived from the SHA1 hash.
- Note there is no `git cat-file` command to return the filename... It isn't stored!
- Git objects are comprised of three fields and a delimiter: content + object type + object length = hash .

For example, recall our earlier hash. We can reproduce the same result with the following command

![git/IMG_5.png](git/IMG_5.png)

Thus, for our original command `echo "Hello, Git"` we know git is storing

1. `blob` - the type
2. `11` - the length
3. `\0` - the delimiter
4. `Hello, Git` - the contents!

NOTE: if using terminal, make sure to pass `echo -e` to interpret backslash characters.

### Tree objects in Git

![git/IMG_6.png](git/IMG_6.png)

Trees are stored as links to blobs or other trees, as above. Trees store file names of the git blobs themselves, which is why filenames need not be stored in git blobs!

The structure goes like: permission, object type, hash, name. In order to use the `mktree` command, one only need create a txt file and list the objects as formatted in the above image.

![git/IMG_7.png](git/IMG_7.png)

By passing the two blob objects with permissions and their corresponding hashes to `git mktree`, we get a tree object with the hash `3b95df0ac6365c72e9b0ff6c449645c87e6e1159`.

![git/IMG_8.png](git/IMG_8.png)

- Git objects permissions

### Examining a tree object

- We can use `git cat-file -p` to examine the contents of our tree— which should be what we passed in `temp-tree.txt`.
- The size & type can be found with the `-s` & `-p` parameters

![git/IMG_9.png](git/IMG_9.png)

![git/IMG_10.png](git/IMG_10.png)

So, using only low-level commands, we've created the following file-structure in our repository:

![git/IMG_11.png](git/IMG_11.png)

### Overview of file distribution

![git/IMG_12.png](git/IMG_12.png)

Git uses a _Staging Area_ or _Index_ to transition files from the working directory to the repository or restore them from the repository to the working directory. Using the command `git ls-files` we can examine the staging area.

`git read-tree <hash>` is used to move files from the repository to the staging area. Using `read-tree` moves the tree and all files therein to staging. For example, to move the tree we created above:

![git/IMG_13.png](git/IMG_13.png)

You can see `ls-files` returns those in our tree. The `-s` parameter allows a list view, which shows permissions, a hash, a _zero_ indicating that these files in staging are identical to those in the repository, and the file names.

Note when using read tree, the terminal indicates a change in the repository. The yellow highlight means that there are uncommitted changes in master (the other screenshots don't show this b/c I deviated from directions).

![git/IMG_14.png](git/IMG_14.png)

Using `git checkout-index -a` , we can grab all of the files in the staging area and move them to the working directory.

![git/IMG_15.png](git/IMG_15.png)

These are the steps to manually move files from a repository to a staging area and recreate the same files in a working directory!

## Basic Git ops

Since git is a distributed version control system, author info is reported in each commit. User information can be set with the following commands

- Set author name

  `git config --global user.name <Name>`

- Set author email

  `git config --global user.email <Email>`

### Creating a commit

I would be remiss if I didn't at least mention how to make a commit. `git commit -m` moves items from the staging area to the repository with a message. Use `git status` to see, you guessed it, the status of the repo.

![git/IMG_16.png](git/IMG_16.png)

Note we now have a new git object, it's our commit! The commit has a pointer to the tree we changed, as well as author information and the commit message.

![git/IMG_17.png](git/IMG_17.png)

### Manually moving files from working-dir to repo

![git/IMG_18.png](git/IMG_18.png)

In the previous example, we created two blobs and a tree in the repo and moved them all across the index to the working directory, creating a commit. But what about the more natural flow— moving from the working directory, to staging, to the repo?

That is achieved with the more common git commands, which I'm sure you're familiar with:

- Basic Git commands

  `git status` - current state of the repository

  `git add` - adds files to the staging area (from working directory)

  `git commit` - writes changes to git repository (creates commit object)

  `git log` - history of changes (commits)

  `git checkout` - checkout commit or branch

First, we create a new file in our repository `nano file3.txt` and add some contents.

Next, we add the new file to the staging area `git add`. Until we add the file, it will be _untracked._ There are four possible statuses for git files.

- Git file tracking statuses

  ![git/IMG_19.png](git/IMG_19.png)

  - Untracked

    Any new files added to a working directory will be untracked until added to the staging area.

    ![git/IMG_20.png](git/IMG_20.png)

  - Unmodified

    For an unmodified file, we must commit staged files using `git commit`. Unmodified files can be removed or ignored from git.

  - Modified

    Changing a file in the working directory that is already tracked will change it's state to modified.

  - Staged

    To move a file from untracked to a staged state, use `git add` , this initiates file tracking.

`git status` can be used to investigate the status of files in a working directory.

Finally, with the file in the staging area, we use `git commit` to move it to the repo.

Should a staged file want to be ignored, we can use `git rm --cached <filename>` to remove the file from staging and untrack it.

![git/IMG_21.png](git/IMG_21.png)

`git log` can be used to see a history of commits

![git/IMG_22.png](git/IMG_22.png)

`git cat-file -p <hash>` is useful for illustrating how commits are linked. Invoking the command on our second command returns a tree & parent— the latter being a pointer back to the first commit. This can be confirmed with the same command on that hash.

![git/IMG_23.png](git/IMG_23.png)

So, in commit objects, Git is keeping track of hashes, but also linking back to previous commits. This allows for reversion to different project snapshots!

## Git branches & head

![git/IMG_24.png](git/IMG_24.png)

### What is a branch?

A branch is just a _text reference_ to a commit.

- Default branch is **master**
- Multiple branches can exist in the same repo
- Pointers for all branches are located in `.git/refs/heads` folder
- Only the current branch tracks new commits
- The branch pointer moves automatically after every new commit
- Use `git checkout <branch>` to change the branch

Looking in the folder where branches are stored, we can see our project only has one branch `master` . Examining the file contents, we find a pointer to the most recent commit!

![git/IMG_25.png](git/IMG_25.png)

### What is HEAD?

Q: How does Git know which branch is current?

A: That's where HEAD is used. HEAD is a pointer or reference to the currently checked-out branch in commit.

- Head is locally significant— if you work in a distributed project, you can move head locally without effecting others
- The HEAD pointer can be found in `.git/HEAD`
- The default pointer is `ref`: `refs/heads/master`
- To change reference to a specific branch use `git checkout <branch>`
- To change reference to a specific commit use `git checkout <sha1>`

As you can see below, HEAD points to master, which points to the second commit!

![git/IMG_26.png](git/IMG_26.png)

But what if we delete all of our files and commit them?

![git/IMG_27.png](git/IMG_27.png)

While there are no files in our repository, all of the old Git objects still exist in their designated folder— Git stores the entire history of the project.

### Checking out a specific commit

In order to move HEAD to a different version of the project, we use `git checkout <sha1>`, which moves the HEAD pointer. There are a few ways to find a sha1— GitHub is probably the easiest (only the first few characters are needed):

![git/IMG_28.png](git/IMG_28.png)

Another option is to `git cat-file -p <sha1>` of the current master— this will show `tree`, `parent`, author, and other info. The `parent` refers to the prior commit, which is what we're after:

![git/IMG_29.png](git/IMG_29.png)

For example, to undo the delete operation:

![git/IMG_30.png](git/IMG_30.png)

But what is a _detached HEAD state_? (it certainly doesn't sound good)

Normally, HEAD points to the branch. For example HEAD → master → commit. Since we checked out a commit, HEAD now points directly to it: HEAD → commit.

![git/IMG_31.png](git/IMG_31.png)

And now, voila! We have our three files back in our original directory & staging area.

![git/IMG_32.png](git/IMG_32.png)

Note: since we moved back to the second commit, we'll see no reference to the third commit in `git log`, since the second commit exists unaware of that future state.

![git/IMG_33.png](git/IMG_33.png)

To return to our third commit, we simply type `git checkout master`.

### Git Branch management

- `git branch` - list all local branches.
- `git branch <name>` - create new branch.
- `git checkout <name>` - checkout specific branch.
- `git branch -d <name>` - delete a merged (or uncommitted) branch.
- `git branch -D <name>` - delete any branch (force delete).
- `git branch -m <old> <new>` - rename specific branch.
- `git checkout -b <branch name>` - shortcut to create & checkout a branch.

Note: when creating a new branch, we're essentially cloning the current branch. As an example, we can see that the `sha1` of a recently created branch and _master_ are identical— again, that's because branches are just pointers to specific commits.

![git/IMG_34.png](git/IMG_34.png)

Checking out this new branch replaces the contents of the HEAD file to point to our temp branch instead of _master_.

![git/IMG_35.png](git/IMG_35.png)

**An interesting point:** if we create a new branch with a new file which has identical contents to one of our earlier files _"Hello, Git"_ we will find that Git reuses the same blob, even if the file name differs.

![git/IMG_36.png](git/IMG_36.png)

## Cloning, exploring, and modifying public repos

Each GitHub repository is stored under an account— most repo

![git/IMG_37.png](git/IMG_37.png)

There are multiple methods to obtain the code for a repo. GitHub allows you to clone with HTTPS, SSH, or GitHub CLI, Open with GitHub Desktop, or Download ZIP. One pitfall of downloading a zip of the repo is that the `.git` folder _will not be included._ Hence, if you want to checkout different commits, branches, etc. it's best to clone.

Cloning is as simple as:

![git/IMG_38.png](git/IMG_38.png)

Now, the folder `hello-world` is stored locally, but is also under Git control on the _master_ branch. Additionally, the `.git` folder is present and the `git log` contains the entire project history.

Once a repo is cloned, we can then create a new branch, make adjustments, add files to staging, and commit to a local version... Just as before.

In the following example, I checkout a new branch `new-feature` and make a commit. Notice the Git log:

![git/IMG_39.png](git/IMG_39.png)

While `new-feature` is HEAD, the previous commit is labeled `origin/master`, `origin/HEAD`, and `master`. This is because that commit is the last one pulled from the remote repo (origin). Since we pulled from remote, our local repository and the remote repository are connected— we can see the status of remote as of the pull.

### Git diff

![git/IMG_40.png](git/IMG_40.png)

The `git diff` command presents a file summarizing the difference between two files in a commit. The structure is as follows:

1. The two files with a difference.
2. The SHA1 hashes of each file.
3. A maker indicating the start of the changed section, for example `@@-3,6 +3,8 @@`.
   - `-3` - the first line where changes began in the old file
   - `6` - the quantity of lines in a given section in the old file.
   - `+3` - first line in new file
   - `8` - total quantity of lines in the new file
4. The changes.

![git/IMG_41.png](git/IMG_41.png)

In the above image, -3 shows the start of the old file (left column) and total number of lines (left column 3 to 8 is 6 total lines). +3 is the start of the new file (right column) and 8 is the total number of new lines (3 to 10 is 8 lines).

## Merging branches & merge conflicts

**Merge steps:**

1. Create new feature branch from the main branch
2. Make changes in the new branch and commit them
3. Checkout main branch (receiving branch)
4. Merge feature branch to the current receiving branch `git merge <feature-branch>`

**Why is Merging Needed?**

We often consider `master` to be the "main" branch, which we then branch off to work on features or changes. On a development team, new code is constantly being added to `master` in parallel. So how do you incorporate your changes while allowing your teammates to continue working on and updating `master`? That's where merging comes in. There are two main types of merge to discuss.

- Fast-forward merge
  - In a fast forward merge, your feature is ahead of `master` and `master` has no other commits. The `master` branch pointer is simply moved to your commit— your branch becomes `master` and the feature branch may be deleted. This is a very straightforward and simple merge.
- Three-way merge

  - In a three-way merge, your feature is behind `master`. You want to merge, but you _don't_ want to lose updates made since checkout. In these cases, git finds the nearest _ancestor_ (common commit between both branches).

    - To perform such a merge, git takes the ancestor, applies changes, and merges your feature. In the process, it moves HEAD to the new commit.
    - The new commit has two parents— the new ancestor branch and the feature. See the images below for before/after:

      ![git/IMG_42.png](git/IMG_42.png)

      ![git/IMG_43.png](git/IMG_43.png)

**What is a Merge Conflict?**

- Merge conflicts can appear when the same files are edited in multiple branches.
- Merge conflicts do not exist in fast-forward merges, where no other commits are made after HEAD, since there is no way for conflicts to appear.
  - Hence, merge conflicts can only arise in three way merges
- Conflicts must be resolved manually before changes can be merged.

**Resolving Merge Conflicts**

To reiterate, Git is a distributed version-control system while GitHub is a repository hosting service, designed to collaborate on and share Git repositories.

## Git push, fetch, and pull

- `Git push` sends changes committed in a local repository to a remote repository.
- `Git fetch` grabs updates from a remote repository to a local repository, but does not update the staging area or working directory. For example, if you `git fetch` a new branch, you will be able to see new branches, but your files will not be changed
- `Git checkout`
- `Git pull` is a combination of `git fetch` and `git checkout` . The command grabs new changes in a remote repository, pulls them in, merges them into your local staging area, and writes them to your working directory.

![git/IMG_44.png](git/IMG_44.png)

- When a remote repository is cloned, Git creates a connection between local and remote repos. The default name for the remote repository is **origin.** The command `git remote` lists all servers for remote repositories.

  ![git/IMG_45.png](git/IMG_45.png)

- `git branch` will show all local branches for the remote repository, the option `-a` will show _all_ branches, including remote.

  ![git/IMG_46.png](git/IMG_46.png)

- The tracking branch is your local branch connected to a specific remote branch. The default branch in a remote repository is `master`, but it can easily be changed in the GitHub settings.
- `git remote show origin` provides more verbose output, which includes the fetch and push URLs, the HEAD branch, all remote branches, local branches configured for `git pull` , and local refs configured for `git push` as well as their statuses.
- `git remote prune` removes stale branches from a local repository— that is, it deletes local branches that were removed remotely.

![git/IMG_47.png](git/IMG_47.png)

As previously mentioned, `git pull` is a two step process. As illustrated above, `git fetch` is first performed, which grabs all data from the remote Git repository and stores it locally. Git then performs `git merge FETCH_HEAD` to make the local repo current.

**Overview of Git pull**

1. Checkout local branch and make sure it's the tracking branch and has a corresponding remote. Use `git branch -vv` to check.
2. `git pull`
3. Git will fetch all changes from remote, `git fetch` is executed in the background.
4. After fetching Git updates `FETCH_HEAD` file that contains SHA1 hashes of the last commits in remote for all tracking branches.
5. Git merges remote into current branch `git merge FETCH_HEAD`, note this step is entirely local!

![git/IMG_48.png](git/IMG_48.png)

So what exactly is `FETCH_HEAD`? In the `.git` folder, there exist `HEAD`, `ORIG_HEAD`, and `FETCH_HEAD` files. Inspecting the `FETCH_HEAD` file, we find a list of branches and their status.

![git/IMG_49.png](git/IMG_49.png)

When `git fetch` is executed as part of `git pull`, git will update `.git/FETCH_HEAD` , which lists all available branches. The first branch in this list will be the checked out branch. Then, when `git merge FETCH_HEAD` is executed, the first branch listed in the `FETCH_HEAD` file without the _not-for-merge_ tag will be merged into local tracking for the current branch.

**Pushing to a remote repository**

To create a new branch locally, use `git checkout -b [branch]`. To inspect, `git branch -vv` lists local branches, `git branch -r` lists remote branches. `git branch -a` lists all local and remote branches with their status.

In order to push our new local branch and create a corresponding remote branch, we need to use `git push --set-upstream origin [branch]`. You can replace `--set-upstream` with `-u` to save some time!

Now that the branches are linked, you can simply `git push` to update the local and remote branches simultaneously.

Should a remote branch be deleted, you can update tracking statuses for local branches using the command `git remote update origin --prune` & confirm local changes using `git branch --vv`.

To remove a remote branch using the local terminal using the command `git push origin -d [branch]`.

`git show-ref` shows all references, both local & remote. Pass a branch to the command to see a reference for that particular branch.

![git/IMG_50.png](git/IMG_50.png)

Here, we can see the hashes are identical for remote and local copies of master— this is a quick and easy way to check if a branch is up-to-date with it's remote counterpart from the terminal.

## Git tags

![git/IMG_51.png](git/IMG_51.png)

A **Tag** is a static text pointer to a specific commit. Tags were introduced to fill the void left by branches, which are dynamic pointers to different commits. At anytime, we can checkout a specific tag and move directly to that commit.

Git tags are mostly used to add release versions to a project. For example, we could add a specific tag anytime a `feature` branch is merged into master.

### **Staging vs. Production**

In modern software development, most projects adhere to CI/CD principals (Continuous Integration / Continuous Development). With CI/CD, you're using two separate development environments: **Staging** and **Production**.

**Staging**

- Corresponding branch: `release`
- Primarily for testing, internal use
- Frequent merges
- Different feature branches are merged into a release branch
- Many have merge rights

**Production**

- Corresponding branch: `master`
- For stable production service, externally facing
- Merging happens on a release cycle— typically monthly or bi-monthly.
- Only release branch is merged into `master`.
- Few have merge rights.

### Semantic Versioning

**Semantic Versioning** is a common convention for version naming. In semantic version, each number corresponds to a particular component of the version. The convention is `MAJOR.MINOR.PATCH`, see [semver.org](http://semver.org) for specifics on this.

There are two different types of tags in Git: **lightweight** and **annotated.** While both are stored in `.git/refs/tags`, annotated tags are also stored in `.git/objects` and include a tag message, author, and date.

Lightweight— `git tag v1.0.0`

Annotated— `git tag -a v1.0.0 -m "Hello, world"`

**Note:** tag names must be unique across an entire repository.

## Rebasing

Rebasing is a different way to merge two branches together. There are some advantages and disadvantages to this method.

1. Rebasing rewrites history— it doesn't keep the entire history of all commits (some commits are lost).
2. History becomes linear— with merging, there are commits with multiple parents, but with rebasing every commit has a single parent (if you rebase & merge branches).

![git/IMG_52.png](git/IMG_52.png)

### Rebasing Steps

1. Checkout `feature` branch— `git checkout feature-1`
2. Rebase `feature` branch on top of the `base` branch— `git rebase master`
3. Checkout `base` branch— `git checkout master`
4. Merge `feature` branch into the `base` branch using fast forward merge— `git merge feature-1`

In steps 1 & 2, we're rebasing the feature branch onto the base branch. In steps 3 & 4, we're merging feature into base.

When a rebase is performed, git creates copies of old commits and moves them to master. Old commits are garbage collected.

![git/IMG_53.png](git/IMG_53.png)

## Ignoring files in Git

A `.gitignore` file explicitly tells Git which files/folders to ignore. While files within `.gitignore` will not be added to the repository, `.gitignore` must be in the repository itself (usually in the root of the repo).

### Basic gitignore rules

There are three statuses in Git: untraced, tracked, and ignored. Within the tracked status, there are the three sub-statuses which we're familiar with now: unmodified, modified, and staged. The `.gitignore` folder defines the rules for which files end up in the ignored status.

Within a `.gitignore` file, you can specify to ignore a single file within a repository (just list the name) or an entire folder. ([FOLDER]/) Wildcards also apply. An example gitignore file might look like:

```
#Ignore single file
new-file.txt

#Ignore directory
bin/

#Ignore temp files
*.tmp
```

In order to commit a previously ignored file, simply remove the filename from gitignore. To ignore a previously committed file, just add the filename back into gitignore and commit. If you'd like the file to remain in the working directory, run the command `git rm --cached [FILE]` — this will keep the file in the local directory, while removing it from the repo.

### Common practices & templates

**Best Practices**

- build folders like `/bin` — these can be created from the repository itself
- dependency folders like `node_modules`
- compiled and log files like `*.pyc, *log`
- hidden OS files like `Thumbs.db` or `.DS_Store`

[gitignore.io](http://gitignore.io) has some example templates for various languages. [github.com/github/gitignore](http://github.com/github/gitignore) is a collection of gitignore files for specific applications.

## Detached HEAD

**Detached HEAD** occurs when you checkout a particular commit using its SHA1 hash. The HEAD no longer points to a branch, but rather _only_ a commit. In a detached HEAD state, you can create commits outside of any particular branch! HEAD will point to these new commits, but they too will be outside any branch.

Returning to another branch with `git checkout master` , for example, will bring you back to that state. Since commits in the detached state were outside of a branch, they will be garbage collected by Git (this occurs in 30 days). In order to keep changes, you can checkout a branch with changes made in the detached state.

This means that a detached HEAD state is a good opportunity for experimental commits— if something breaks you can simply checkout another branch without having to create a separate branch or delete it when you're done.