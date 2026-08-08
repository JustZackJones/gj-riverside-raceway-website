export const facebook = {
    baseUrl: 'https://www.facebook.com/',
    groupUrl: `https://www.facebook.com/share/g/1bRsCDdtpa/`,
    groupName: 'Grand Valley RC Racing',
    checkMeContent: ():  React.JSX.Element => (
        <a href={facebook.groupUrl} target="_blank" rel="noopener noreferrer" className='text-[#1877F2]'>
            Check facebook for more info!
        </a>
    ),
    primaryContactUrl: 'https://www.facebook.com/groups/961239392247400/user/61551234750535',
    primaryContactName: 'John Jones',
    primaryContactContent: (): React.JSX.Element => (
        <a href={facebook.primaryContactUrl} target="_blank" rel="noopener noreferrer" className='text-[#1877F2]'>
            {facebook.primaryContactName}
        </a>
    )

}