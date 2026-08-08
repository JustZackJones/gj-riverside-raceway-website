import { about } from '@/content/about';
import { facebook } from '@/content/facebook';

export const footer = [
    {
        items: [
            { icon: 'fas fa-map-marker-alt', content: about.getAddressAnchorTag() }, 
            { icon: 'fa-brands fa-facebook-messenger', content: facebook.primaryContactContent() }
        ]
    }, {
        items: [
            { icon: 'fas fa-copyright', content: `${new Date().getFullYear()} ${about.name}` }, 
            { icon: 'fas fa-desktop', content: `Website by ${about.websiteBy}` }
        ]
    }
]