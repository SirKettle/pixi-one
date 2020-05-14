export function logGameCredits() {
  try {
    console.log(
      `%c${_bundle.name} 
%c
${_bundle.description} - by ${_bundle.authorName} (${_bundle.authorUrl})
v${_bundle.buildVersion} (${_bundle.environment} mode, ${_git.branch} branch)`,
      'font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)',
      'font-size: 10px'
    );
    console.log('With thanks to Zapsplat.com for providing some of the sounds');
  } catch (e) {
    console.warn('Error accessing bundle information');
  }
}
